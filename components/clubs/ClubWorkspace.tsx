"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  Globe,
  Lock,
  MoreHorizontal,
  Settings2,
  Users2,
} from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { ReadingCycleDialog } from "@/components/clubs/ReadingCycleDialog";
import { ReadingCycleEditDialog } from "@/components/clubs/ReadingCycleEditDialog";
import { ReadingCycleSection } from "@/components/clubs/ReadingCycleSection";
import { NextBookPanel } from "@/components/clubs/NextBookPanel";
import { StructuredDiscussionPanel } from "@/components/clubs/StructuredDiscussionPanel";
import JoinRequestsPanel from "@/components/pages/clubs/JoinRequestsPanel";
import MembersPanel from "@/components/pages/clubs/MembersPanel";
import OwnerLeaveDialog from "@/components/pages/clubs/OwnerLeaveDialog";
import {
  CoverImage,
  EmptyState,
  ErrorState,
  InlineLink,
  SectionHeader,
  StatusBadge,
} from "@/components/ui/app-primitives";
import { useToast } from "@/components/ui/use-toast";
import { useAuthState } from "@/hooks/useAuthState";
import { useClubModeration } from "@/hooks/useClubModeration";
import { useJoinClubAction } from "@/hooks/useJoinClubAction";
import { useMemberManagement } from "@/hooks/useMemberManagement";
import { getClubById, getClubMembers } from "@/lib/clubs";
import {
  cancelReadingCycle,
  completeReadingCycle,
  createReadingCycle,
  createReadingTarget,
  deleteReadingTarget,
  getCurrentReadingCycle,
  getReadingProgress,
  getReadingCycles,
  getReadingTargets,
  reorderReadingTargets,
  startReadingCycle,
  updateMyReadingProgress,
  updateReadingCycle,
  updateReadingTarget,
} from "@/lib/reading-cycles";
import type {
  Club,
  CreateReadingCyclePayload,
  CreateReadingTargetPayload,
  ReadingProgressResponse,
  ReadingCycle,
  ReadingTarget,
  UpdateReadingCyclePayload,
} from "@/lib/types";

export type ClubWorkspaceView =
  | "overview"
  | "reading"
  | "discussion"
  | "next-book"
  | "members"
  | "about"
  | "manage";

const CLUB_TABS: Array<{ label: string; view: ClubWorkspaceView; memberOnly?: boolean; ownerOnly?: boolean }> = [
  { label: "Overview", view: "overview" },
  { label: "Reading", view: "reading", memberOnly: true },
  { label: "Discussion", view: "discussion", memberOnly: true },
  { label: "Next Book", view: "next-book", memberOnly: true },
  { label: "Members", view: "members", memberOnly: true },
  { label: "About", view: "about" },
  { label: "Manage", view: "manage", ownerOnly: true },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getAuthorsLabel(authors: string[]) {
  return authors.length > 0 ? authors.join(", ") : "Unknown author";
}

function getDaysRemaining(targetEndDate: string) {
  const days = Math.ceil(
    (new Date(targetEndDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );
  if (days < 0) return "Target date passed";
  if (days === 0) return "Ends today";
  if (days === 1) return "1 day remaining";
  return `${days} days remaining`;
}

function tabHref(clubId: string, view: ClubWorkspaceView) {
  if (view === "overview") return `/clubs/${clubId}`;
  return `/clubs/${clubId}/${view}`;
}

export function ClubWorkspace({ view }: { view: ClubWorkspaceView }) {
  const params = useParams();
  const router = useRouter();
  const clubId = params.id as string;
  const { isAuthenticated, isReady, logout, user } = useAuthState();
  const { toast } = useToast();

  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingRequest, setPendingRequest] = useState(false);
  const [ownerLeaveModalOpen, setOwnerLeaveModalOpen] = useState(false);
  const [readingCycles, setReadingCycles] = useState<ReadingCycle[]>([]);
  const [publicCurrentCycle, setPublicCurrentCycle] =
    useState<ReadingCycle | null>(null);
  const [isReadingCycleLoading, setIsReadingCycleLoading] = useState(false);
  const [readingCycleDialogOpen, setReadingCycleDialogOpen] = useState(false);
  const [editingReadingCycle, setEditingReadingCycle] =
    useState<ReadingCycle | null>(null);
  const [readingCycleActionId, setReadingCycleActionId] = useState<
    string | null
  >(null);
  const [readingProgress, setReadingProgress] =
    useState<ReadingProgressResponse | null>(null);
  const [isReadingProgressLoading, setIsReadingProgressLoading] =
    useState(false);
  const [readingProgressError, setReadingProgressError] = useState("");
  const [isReadingProgressSaving, setIsReadingProgressSaving] =
    useState(false);
  const [readingTargets, setReadingTargets] = useState<ReadingTarget[]>([]);
  const [isReadingTargetsLoading, setIsReadingTargetsLoading] = useState(false);
  const [readingTargetsError, setReadingTargetsError] = useState("");
  const [readingTargetAction, setReadingTargetAction] = useState("");

  const shouldLoadReadingCycleData =
    view === "overview" || view === "reading";
  const shouldLoadMembers =
    view === "members" || view === "manage";
  const shouldLoadJoinRequests =
    view === "manage" &&
    (club?.memberRole === "OWNER" || club?.memberRole === "MODERATOR") &&
    !club?.isPublic;

  const memberManagement = useMemberManagement(clubId);
  const { setLoading: setMembersLoading, setMembers } = memberManagement;

  const loadMembers = useCallback(async () => {
    try {
      setMembersLoading(true);
      const members = await getClubMembers(clubId);
      setMembers(members);
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setMembersLoading(false);
    }
  }, [clubId, setMembers, setMembersLoading]);

  const loadClub = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getClubById(clubId);
      setClub(response.club);
      setPendingRequest(Boolean(response.club.hasPendingJoinRequest));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch club";
      setError(message);
      toast({
        variant: "destructive",
        title: "Failed to fetch club",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [clubId, toast]);

  useEffect(() => {
    void loadClub();
  }, [loadClub]);

  const loadReadingCycleData = useCallback(async () => {
    if (!club || !shouldLoadReadingCycleData) return;

    try {
      setIsReadingCycleLoading(true);
      if (isAuthenticated && club.isMember) {
        const data = await getReadingCycles(clubId);
        setReadingCycles(data.readingCycles);
        setPublicCurrentCycle(null);
        return;
      }

      const readingCycle = await getCurrentReadingCycle(clubId);
      setPublicCurrentCycle(readingCycle);
      setReadingCycles([]);
    } catch (err) {
      console.error("Failed to load reading cycles:", err);
    } finally {
      setIsReadingCycleLoading(false);
    }
  }, [club, clubId, isAuthenticated, shouldLoadReadingCycleData]);

  useEffect(() => {
    if (!shouldLoadReadingCycleData) {
      setReadingCycles([]);
      setPublicCurrentCycle(null);
      setIsReadingCycleLoading(false);
      return;
    }

    void loadReadingCycleData();
  }, [loadReadingCycleData, shouldLoadReadingCycleData]);

  const moderation = useClubModeration(clubId);
  const { loadRequests } = moderation;

  useEffect(() => {
    if (!club?.memberRole || !shouldLoadJoinRequests) return;

    loadRequests().catch(() => {
      console.error("Failed to load join requests");
    });
  }, [club?.memberRole, loadRequests, shouldLoadJoinRequests]);

  useEffect(() => {
    if (!club?.isMember || !shouldLoadMembers) return;

    loadMembers().catch(() => {
      console.error("Failed to load members");
    });
  }, [club?.isMember, loadMembers, shouldLoadMembers]);

  useEffect(() => {
    if (!isLoading && club && view === "manage" && club.memberRole !== "OWNER") {
      router.replace(`/clubs/${clubId}`);
    }
  }, [club, clubId, isLoading, router, view]);

  const {
    joiningClubId,
    joinClub: handleJoinClick,
    leaveClub: handleLeaveClick,
    cancelJoinRequest: handleCancelJoinRequestClick,
  } = useJoinClubAction<Club>({
    isAuthenticated,
    onSuccess: (joinedClub, memberCount, action) => {
      if (action === "join" && !joinedClub.isPublic) {
        setPendingRequest(true);
      } else if (action === "cancel") {
        setPendingRequest(false);
      }
      setClub((current) =>
        current && current.id === joinedClub.id
          ? {
              ...current,
              memberCount,
              isMember: action === "join" && joinedClub.isPublic,
              hasPendingJoinRequest:
                action === "join" && !joinedClub.isPublic
                  ? true
                  : action === "cancel"
                    ? false
                    : current.hasPendingJoinRequest,
            }
          : current,
      );
    },
  });

  const currentCycle = useMemo(
    () =>
      readingCycles.find((cycle) => cycle.status === "ACTIVE") ??
      readingCycles.find((cycle) => cycle.status === "PLANNED") ??
      club?.currentReadingCycle ??
      publicCurrentCycle,
    [club?.currentReadingCycle, publicCurrentCycle, readingCycles],
  );

  const plannedCycle = readingCycles.find((cycle) => cycle.status === "PLANNED");
  const completedCycles = readingCycles.filter(
    (cycle) => cycle.status === "COMPLETED",
  );

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "R";
  const isOwner = club?.memberRole === "OWNER";
  const isMember = Boolean(club?.isMember);

  const shouldLoadReadingProgress =
    view === "reading" && isAuthenticated && isMember && Boolean(currentCycle);

  const loadReadingProgressData = useCallback(async () => {
    if (!currentCycle || !shouldLoadReadingProgress) return;

    try {
      setIsReadingProgressLoading(true);
      setReadingProgressError("");
      const progress = await getReadingProgress(clubId, currentCycle.id);
      setReadingProgress(progress);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load reading progress";
      setReadingProgressError(message);
    } finally {
      setIsReadingProgressLoading(false);
    }
  }, [clubId, currentCycle, shouldLoadReadingProgress]);

  useEffect(() => {
    if (!shouldLoadReadingProgress) {
      setReadingProgress(null);
      setReadingProgressError("");
      setIsReadingProgressLoading(false);
      return;
    }

    void loadReadingProgressData();
  }, [loadReadingProgressData, shouldLoadReadingProgress]);

  const loadReadingTargetsData = useCallback(async () => {
    if (!currentCycle || !shouldLoadReadingProgress) return;

    try {
      setIsReadingTargetsLoading(true);
      setReadingTargetsError("");
      const response = await getReadingTargets(clubId, currentCycle.id);
      setReadingTargets(response.targets);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load reading plan";
      setReadingTargetsError(message);
    } finally {
      setIsReadingTargetsLoading(false);
    }
  }, [clubId, currentCycle, shouldLoadReadingProgress]);

  useEffect(() => {
    if (!shouldLoadReadingProgress) {
      setReadingTargets([]);
      setReadingTargetsError("");
      setIsReadingTargetsLoading(false);
      return;
    }

    void loadReadingTargetsData();
  }, [loadReadingTargetsData, shouldLoadReadingProgress]);

  const onLeavePressed = () => {
    if (!club) return;
    if (club.memberRole === "OWNER") {
      setOwnerLeaveModalOpen(true);
      return;
    }
    void handleLeaveClick(club);
  };

  const handleCreateReadingCycle = async (
    payload: CreateReadingCyclePayload,
  ) => {
    const readingCycle = await createReadingCycle(clubId, payload);
    await loadReadingCycleData();
    toast({
      title: "Reading cycle saved",
      description: `${readingCycle.book.title} is ready for this club.`,
    });
    return readingCycle;
  };

  const handleUpdateReadingCycle = async (
    cycle: ReadingCycle,
    payload: UpdateReadingCyclePayload,
  ) => {
    const updatedCycle = await updateReadingCycle(clubId, cycle.id, payload);
    await loadReadingCycleData();
    toast({
      title: "Reading cycle updated",
      description: `${updatedCycle.book.title} has a refreshed schedule.`,
    });
    return updatedCycle;
  };

  const handleStartReadingCycle = async (cycle: ReadingCycle) => {
    try {
      setReadingCycleActionId(cycle.id);
      await startReadingCycle(clubId, cycle.id);
      await loadReadingCycleData();
      toast({
        title: "Reading cycle started",
        description: `${cycle.book.title} is now the club's current read.`,
      });
    } finally {
      setReadingCycleActionId(null);
    }
  };

  const handleCompleteReadingCycle = async (cycle: ReadingCycle) => {
    try {
      setReadingCycleActionId(cycle.id);
      await completeReadingCycle(clubId, cycle.id);
      await loadReadingCycleData();
      toast({
        title: "Reading cycle completed",
        description: `${cycle.book.title} has been added to reading history.`,
      });
    } finally {
      setReadingCycleActionId(null);
    }
  };

  const handleCancelReadingCycle = async (cycle: ReadingCycle) => {
    try {
      setReadingCycleActionId(cycle.id);
      await cancelReadingCycle(clubId, cycle.id);
      await loadReadingCycleData();
      toast({
        title: "Reading cycle cancelled",
        description: `${cycle.book.title} is no longer scheduled.`,
      });
    } finally {
      setReadingCycleActionId(null);
    }
  };

  const handleUpdateReadingProgress = async (progressPercentage: number) => {
    if (!currentCycle) return;

    try {
      setIsReadingProgressSaving(true);
      setReadingProgressError("");
      const progress = await updateMyReadingProgress(clubId, currentCycle.id, {
        progressPercentage,
      });
      setReadingProgress(progress);
      toast({
        title: "Progress updated",
        description: `${progressPercentage}% has been saved for this read.`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to update progress";
      setReadingProgressError(message);
      toast({
        variant: "destructive",
        title: "Unable to update progress",
        description: message,
      });
    } finally {
      setIsReadingProgressSaving(false);
    }
  };

  const handleCreateReadingTarget = async (
    payload: CreateReadingTargetPayload,
  ) => {
    if (!currentCycle) return;

    try {
      setReadingTargetAction("create");
      await createReadingTarget(clubId, currentCycle.id, payload);
      await loadReadingTargetsData();
      toast({
        title: "Reading target added",
        description: "The reading plan has been updated.",
      });
    } finally {
      setReadingTargetAction("");
    }
  };

  const handleUpdateReadingTarget = async (
    targetId: string,
    payload: CreateReadingTargetPayload,
  ) => {
    if (!currentCycle) return;

    try {
      setReadingTargetAction(targetId);
      await updateReadingTarget(clubId, currentCycle.id, targetId, payload);
      await loadReadingTargetsData();
      toast({
        title: "Reading target updated",
        description: "The reading plan has been refreshed.",
      });
    } finally {
      setReadingTargetAction("");
    }
  };

  const handleDeleteReadingTarget = async (target: ReadingTarget) => {
    if (!currentCycle) return;

    try {
      setReadingTargetAction(target.id);
      const response = await deleteReadingTarget(clubId, currentCycle.id, target.id);
      setReadingTargets(response.targets);
      toast({
        title: "Reading target deleted",
        description: "The reading plan order has been compacted.",
      });
    } finally {
      setReadingTargetAction("");
    }
  };

  const handleMoveReadingTarget = async (
    targetId: string,
    direction: "up" | "down",
  ) => {
    if (!currentCycle) return;

    const currentIndex = readingTargets.findIndex(
      (target) => target.id === targetId,
    );
    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= readingTargets.length) {
      return;
    }

    const targetIds = readingTargets.map((target) => target.id);
    const [movedTargetId] = targetIds.splice(currentIndex, 1);
    if (!movedTargetId) return;
    targetIds.splice(nextIndex, 0, movedTargetId);

    try {
      setReadingTargetAction(targetId);
      const response = await reorderReadingTargets(clubId, currentCycle.id, {
        targetIds,
      });
      setReadingTargets(response.targets);
    } finally {
      setReadingTargetAction("");
    }
  };

  return (
    <main className="app-page">
      <AppHeader
        mode="app"
        isAuthenticated={isAuthenticated}
        isAuthReady={isReady}
        userInitial={userInitial}
        onLogout={logout}
      />

      <section className="app-container">
        <Link
          href="/clubs"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--app-accent-gold)] transition hover:text-[var(--app-accent-gold-hover)]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Discover
        </Link>

        {isLoading ? (
          <div className="h-64 animate-pulse rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)]" />
        ) : error ? (
          <ErrorState
            title="Unable to load club"
            description={error}
            action={
              <button
                type="button"
                onClick={() => void loadClub()}
                className="app-button-primary"
              >
                Retry
              </button>
            }
          />
        ) : club ? (
          <div className="space-y-6">
            <header className="app-surface-elevated min-w-0 overflow-hidden rounded-2xl">
              <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
                <div className="min-w-0 p-4 md:p-7">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--app-accent-gold)] sm:tracking-[0.22em]">
                        BookCircle club
                      </p>
                      <h1 className="mt-2 break-words font-serif text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                        {club.name}
                      </h1>
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--app-text-secondary)]">
                        {club.description || "No description available."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <StatusBadge tone={club.isPublic ? "teal" : "gold"}>
                        {club.isPublic ? (
                          <Globe className="h-3.5 w-3.5" />
                        ) : (
                          <Lock className="h-3.5 w-3.5" />
                        )}
                        {club.isPublic ? "Public" : "Private"}
                      </StatusBadge>
                      {club.memberRole ? (
                        <StatusBadge tone={isOwner ? "gold" : "muted"}>
                          {club.memberRole === "OWNER" ? "Owner" : "Member"}
                        </StatusBadge>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-4 text-sm text-[var(--app-text-secondary)]">
                    <span className="inline-flex items-center gap-1">
                      <Users2 className="h-4 w-4 text-[var(--app-accent-gold)]" />
                      {club.memberCount ?? 0} members
                    </span>
                    <span>{club.genre || "General"}</span>
                    <span>Created {formatDate(club.createdAt)}</span>
                  </div>

                  <div className="mt-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {isAuthenticated ? (
                      <button
                        type="button"
                        onClick={() =>
                          club.isMember
                            ? onLeavePressed()
                            : pendingRequest
                              ? void handleCancelJoinRequestClick(club)
                              : void handleJoinClick(club)
                        }
                        disabled={joiningClubId === club.id}
                        className={`${club.isMember ? "app-button-secondary" : "app-button-primary"} w-full sm:w-auto`}
                      >
                        {club.isMember
                          ? joiningClubId === club.id
                            ? "Leaving..."
                            : "Leave Club"
                          : pendingRequest
                            ? joiningClubId === club.id
                              ? "Cancelling..."
                              : "Cancel Request"
                            : joiningClubId === club.id
                              ? "Working..."
                              : club.isPublic
                                ? "Join Club"
                                : "Request to Join"}
                      </button>
                    ) : (
                      <Link
                        href={`/auth/login?returnTo=${encodeURIComponent(`/clubs/${club.id}`)}`}
                        className="app-button-primary w-full sm:w-auto"
                      >
                        Join Club
                      </Link>
                    )}
                    {isOwner ? (
                      <Link href={`/clubs/${clubId}/manage`} className="app-button-secondary w-full sm:w-auto">
                        <Settings2 className="h-4 w-4" />
                        Manage
                      </Link>
                    ) : null}
                  </div>
                </div>
                <CoverImage
                  src={club.coverImage}
                  alt={`${club.name} cover`}
                  className="h-48 border-t border-[var(--app-border-subtle)] sm:h-64 lg:h-auto lg:min-h-64 lg:border-l lg:border-t-0"
                />
              </div>
            </header>

            <nav
              className="-mx-1 flex max-w-full gap-2 overflow-x-auto border-b border-[var(--app-border-subtle)] px-1 pb-2"
              aria-label="Club navigation"
            >
              {CLUB_TABS.filter(
                (tab) =>
                  (!tab.memberOnly || isMember) && (!tab.ownerOnly || isOwner),
              ).map((tab) => {
                const active = tab.view === view;
                return (
                  <Link
                    key={tab.view}
                    href={tabHref(clubId, tab.view)}
                    aria-current={active ? "page" : undefined}
                    className={`min-h-11 shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium ${
                      active
                        ? "border-[var(--app-accent-gold)] bg-[var(--app-accent-teal-soft)] text-[var(--app-accent-gold-hover)]"
                        : "border-transparent text-[var(--app-text-secondary)] hover:border-[var(--app-border-subtle)]"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>

            {view === "overview" ? (
              <ClubOverview
                club={club}
                currentCycle={currentCycle}
                membersCount={memberManagement.members.length}
                isMember={isMember}
              />
            ) : null}

            {view === "reading" ? (
              <ReadingCycleSection
                currentCycle={currentCycle ?? null}
                clubId={clubId}
                completedCycles={completedCycles}
                isOwner={isOwner}
                isMember={isMember}
                isLoading={isReadingCycleLoading}
                onCreate={() => setReadingCycleDialogOpen(true)}
                onEdit={setEditingReadingCycle}
                onStart={(cycle) => void handleStartReadingCycle(cycle)}
                onComplete={(cycle) => void handleCompleteReadingCycle(cycle)}
                onCancel={(cycle) => void handleCancelReadingCycle(cycle)}
                actionInProgress={readingCycleActionId}
                progress={readingProgress}
                isProgressLoading={isReadingProgressLoading}
                progressError={readingProgressError}
                isProgressSaving={isReadingProgressSaving}
                onRetryProgress={() => void loadReadingProgressData()}
                onUpdateProgress={handleUpdateReadingProgress}
                targets={readingTargets}
                isTargetsLoading={isReadingTargetsLoading}
                targetsError={readingTargetsError}
                targetActionInProgress={readingTargetAction}
                onRetryTargets={() => void loadReadingTargetsData()}
                onCreateTarget={handleCreateReadingTarget}
                onUpdateTarget={handleUpdateReadingTarget}
                onDeleteTarget={handleDeleteReadingTarget}
                onMoveTarget={handleMoveReadingTarget}
              />
            ) : null}

            {view === "discussion" ? (
              <ClubDiscussion
                club={club}
                currentCycle={currentCycle}
                canChat={isMember}
              />
            ) : null}

            {view === "next-book" ? <NextBookPanel club={club} /> : null}

            {view === "members" ? (
              <MembersPanel
                members={memberManagement.members}
                loading={memberManagement.loading}
                actionInProgress={memberManagement.actionInProgress}
                currentUserRole={club.memberRole ?? "MEMBER"}
                onPromote={memberManagement.promoteToModerator}
                onDemote={memberManagement.demoteToMember}
                onRefresh={loadMembers}
                showEmails={isOwner}
              />
            ) : null}

            {view === "about" ? <ClubAbout club={club} /> : null}

            {view === "manage" && isOwner ? (
              <ClubManage
                club={club}
                clubId={clubId}
                moderation={moderation}
                memberManagement={memberManagement}
                loadMembers={loadMembers}
                plannedCycle={plannedCycle}
                onPlanRead={() => setReadingCycleDialogOpen(true)}
              />
            ) : null}
          </div>
        ) : null}
      </section>

      <OwnerLeaveDialog
        isOpen={ownerLeaveModalOpen}
        clubId={clubId}
        onClose={() => setOwnerLeaveModalOpen(false)}
        onCompleted={() => {
          setOwnerLeaveModalOpen(false);
          router.push("/clubs");
        }}
      />
      <ReadingCycleDialog
        open={readingCycleDialogOpen}
        onOpenChange={setReadingCycleDialogOpen}
        onSubmit={handleCreateReadingCycle}
      />
      <ReadingCycleEditDialog
        cycle={editingReadingCycle}
        onOpenChange={(open) => {
          if (!open) setEditingReadingCycle(null);
        }}
        onSubmit={handleUpdateReadingCycle}
      />
    </main>
  );
}

function ClubOverview({
  club,
  currentCycle,
  membersCount,
  isMember,
}: {
  club: Club;
  currentCycle: ReadingCycle | null;
  membersCount: number;
  isMember: boolean;
}) {
  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <div className="app-surface min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5">
          <SectionHeader title="Current reading" />
          {currentCycle ? (
            <div className="grid min-w-0 gap-5 md:grid-cols-[132px_minmax(0,1fr)]">
              <CoverImage
                src={currentCycle.book.coverImage}
                alt={`${currentCycle.book.title} cover`}
                fit="contain"
                className="mx-auto aspect-[2/3] w-full max-w-[168px] rounded-xl md:max-w-none"
              />
              <div className="min-w-0">
                <StatusBadge tone={currentCycle.status === "ACTIVE" ? "teal" : "gold"}>
                  {currentCycle.status === "ACTIVE" ? "Currently reading" : "Up next"}
                </StatusBadge>
                <h2 className="mt-3 break-words font-serif text-2xl leading-tight sm:text-3xl">
                  {currentCycle.book.title}
                </h2>
                <p className="mt-2 text-sm text-[var(--app-text-secondary)]">
                  {getAuthorsLabel(currentCycle.book.authors)}
                </p>
                <p className="mt-3 text-sm text-[var(--app-text-secondary)]">
                  {formatDate(currentCycle.startDate)} to{" "}
                  {formatDate(currentCycle.targetEndDate)} |{" "}
                  {getDaysRemaining(currentCycle.targetEndDate)}
                </p>
                {currentCycle.goalDescription ? (
                  <p className="mt-3 text-sm leading-6 text-[var(--app-text-secondary)]">
                    {currentCycle.goalDescription}
                  </p>
                ) : null}
                {isMember ? (
                  <div className="mt-5">
                    <InlineLink href={`/clubs/${club.id}/reading`}>
                      Open Reading
                    </InlineLink>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No read announced"
              description="The next shared book has not been selected yet."
            />
          )}
        </div>

        <div className="app-surface min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5">
          <SectionHeader title="Discussion preview" />
          <p className="text-sm leading-6 text-[var(--app-text-secondary)]">
            The live discussion now has its own focused room, so the overview
            stays calm and scannable.
          </p>
          {isMember ? (
            <div className="mt-4">
              <InlineLink href={`/clubs/${club.id}/discussion`}>
                Open Discussion
              </InlineLink>
            </div>
          ) : null}
        </div>
      </section>

      <aside className="space-y-6">
        <div className="app-surface min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5">
          <SectionHeader title="Members" />
          <p className="text-3xl font-semibold">{club.memberCount ?? membersCount}</p>
          <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
            readers in this circle
          </p>
          {isMember ? (
            <div className="mt-4">
              <InlineLink href={`/clubs/${club.id}/members`}>
                View Members
              </InlineLink>
            </div>
          ) : null}
        </div>
        <div className="app-surface min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5">
          <SectionHeader title="About" />
          <p className="line-clamp-4 text-sm leading-6 text-[var(--app-text-secondary)]">
            {club.description || "No description available."}
          </p>
          <div className="mt-4">
            <InlineLink href={`/clubs/${club.id}/about`}>Read more</InlineLink>
          </div>
        </div>
      </aside>
    </div>
  );
}

function ClubDiscussion({
  club,
  currentCycle,
  canChat,
}: {
  club: Club;
  currentCycle: ReadingCycle | null;
  canChat: boolean;
}) {
  return (
    <div className="min-w-0">
      {canChat ? (
        <StructuredDiscussionPanel club={club} currentCycle={currentCycle} />
      ) : (
        <EmptyState
          title="Join to discuss"
          description="Members can access structured topics and live chat."
        />
      )}
    </div>
  );
}

function ClubAbout({ club }: { club: Club }) {
  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[360px_1fr]">
      <CoverImage
        src={club.coverImage}
        alt={`${club.name} cover`}
        className="aspect-[4/3] rounded-2xl lg:aspect-[3/4]"
      />
      <section className="app-surface min-w-0 overflow-hidden rounded-2xl p-4 sm:p-6">
        <SectionHeader title="About this club" />
        <p className="text-base leading-7 text-[var(--app-text-secondary)]">
          {club.description || "No description available."}
        </p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-[var(--app-accent-gold)]">
              Genre
            </dt>
            <dd className="mt-1 text-[var(--app-text-primary)]">
              {club.genre || "General"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-[var(--app-accent-gold)]">
              Privacy
            </dt>
            <dd className="mt-1 text-[var(--app-text-primary)]">
              {club.isPublic ? "Public" : "Private"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-[var(--app-accent-gold)]">
              Created
            </dt>
            <dd className="mt-1 text-[var(--app-text-primary)]">
              {formatDate(club.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-[var(--app-accent-gold)]">
              Members
            </dt>
            <dd className="mt-1 text-[var(--app-text-primary)]">
              {club.memberCount ?? 0}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function ClubManage({
  club,
  clubId,
  moderation,
  memberManagement,
  loadMembers,
  plannedCycle,
  onPlanRead,
}: {
  club: Club;
  clubId: string;
  moderation: ReturnType<typeof useClubModeration>;
  memberManagement: ReturnType<typeof useMemberManagement>;
  loadMembers: () => void;
  plannedCycle?: ReadingCycle;
  onPlanRead: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid min-w-0 gap-4 lg:grid-cols-3">
        <section className="app-surface min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5">
          <SectionHeader title="General" />
          <p className="text-sm leading-6 text-[var(--app-text-secondary)]">
            Edit club details, visibility, genre, and cover.
          </p>
          <div className="mt-4">
            <Link href={`/clubs/${clubId}/settings`} className="app-button-secondary w-full sm:w-auto">
              <Settings2 className="h-4 w-4" />
              Open settings
            </Link>
          </div>
        </section>
        <section className="app-surface min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5">
          <SectionHeader title="Reading cycle" />
          <p className="text-sm leading-6 text-[var(--app-text-secondary)]">
            {plannedCycle
              ? `${plannedCycle.book.title} is planned next.`
              : "Plan the next shared read for this club."}
          </p>
          <button type="button" onClick={onPlanRead} className="app-button-secondary mt-4 w-full sm:w-auto">
            <CalendarDays className="h-4 w-4" />
            Plan Next Read
          </button>
        </section>
        <section className="app-surface min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5">
          <SectionHeader title="Danger zone" />
          <p className="text-sm leading-6 text-[var(--app-text-secondary)]">
            Destructive club actions remain inside settings and require
            confirmation.
          </p>
        </section>
      </div>

      {!club.isPublic ? (
        <JoinRequestsPanel
          requests={moderation.requests}
          loading={moderation.loading}
          actionInProgress={moderation.actionInProgress}
          onApprove={moderation.approveRequest}
          onReject={moderation.rejectRequest}
          onRefresh={moderation.loadRequests}
        />
      ) : null}

      <MembersPanel
        members={memberManagement.members}
        loading={memberManagement.loading}
        actionInProgress={memberManagement.actionInProgress}
        currentUserRole="OWNER"
        onPromote={memberManagement.promoteToModerator}
        onDemote={memberManagement.demoteToMember}
        onRefresh={loadMembers}
        showEmails
      />

      <div className="app-surface min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5">
        <SectionHeader title="More actions" />
        <p className="inline-flex items-center gap-2 text-sm text-[var(--app-text-secondary)]">
          <MoreHorizontal className="h-4 w-4 text-[var(--app-accent-gold)]" />
          Ownership transfer and deletion remain in settings for compatibility.
        </p>
      </div>
    </div>
  );
}
