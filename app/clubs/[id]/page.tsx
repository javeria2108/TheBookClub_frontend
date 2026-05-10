"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Globe, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { Club } from "@/lib/types";
import { getClubById, getClubMembers } from "@/lib/clubs";
import { useAuthState } from "@/hooks/useAuthState";
import { AppHeader } from "@/components/layout/AppHeader";
import { useJoinClubAction } from "@/hooks/useJoinClubAction";
import { useClubModeration } from "@/hooks/useClubModeration";
import { useMemberManagement } from "@/hooks/useMemberManagement";
import JoinRequestsPanel from "@/components/pages/clubs/JoinRequestsPanel";
import MembersPanel from "@/components/pages/clubs/MembersPanel";
import OwnerLeaveDialog from "@/components/pages/clubs/OwnerLeaveDialog";
import { useToast } from "@/components/ui/use-toast";
import { useCallback } from "react";

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clubId = params.id as string;
  const { isAuthenticated, user } = useAuthState();
  const { toast } = useToast();

  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingRequest, setPendingRequest] = useState(false);
  const [ownerLeaveModalOpen, setOwnerLeaveModalOpen] = useState(false);

  const memberManagement = useMemberManagement(clubId);

  const loadMembers = async () => {
    try {
      memberManagement.setLoading(true);
      const members = await getClubMembers(clubId);
      memberManagement.setMembers(members);
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      memberManagement.setLoading(false);
    }
  };

  const loadClub = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getClubById(clubId);
      setClub(response.club);
      setPendingRequest(Boolean(response.club.hasPendingJoinRequest));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch club";
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

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "R";

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
            }
          : current,
      );
    },
  });

  const moderation = useClubModeration(clubId);
  const { loadRequests } = moderation;

  useEffect(() => {
    const role = club?.memberRole;
    if (role === "OWNER" || role === "MODERATOR") {
      loadRequests().catch(() => {
        console.error("Failed to load join requests");
      });
    }
  }, [club?.memberRole, clubId, loadRequests]);

  useEffect(() => {
    const role = club?.memberRole;
    if (role === "OWNER") {
      loadMembers().catch(() => {
        console.error("Failed to load members");
      });
    }
  }, [club?.memberRole, clubId]);

  const onLeavePressed = () => {
    if (!club) return;

    if (club.memberRole === "OWNER") {
      setOwnerLeaveModalOpen(true);
      return;
    }

    void handleLeaveClick(club);
  };

  return (
    <main className="min-h-screen bg-[#1A0F07] text-[#F2E8D9]">
      <AppHeader
        mode="app"
        isAuthenticated={isAuthenticated}
        userInitial={userInitial}
      />

      <section className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-12">
        <Link
          href="/clubs"
          className="mb-8 inline-flex items-center gap-2 text-[#C9A96E] transition hover:text-[#d8b884]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Clubs
        </Link>

        {isLoading ? (
          <div className="rounded-2xl border border-[#C9A96E]/20 bg-[#2A1810] p-8 text-center">
            <p className="text-lg">Loading club...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[#8B4A3C]/60 bg-[#8B4A3C]/15 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[#F2E8D9]">Unable to load club</p>
                <p className="text-sm text-[#F2E8D9]/75">Try again in a moment.</p>
              </div>
              <button
                type="button"
                onClick={() => void loadClub()}
                className="inline-flex items-center gap-2 rounded bg-[#C9A96E] px-4 py-2 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]"
              >
                Retry
              </button>
            </div>
          </div>
        ) : club ? (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="rounded-2xl border border-[#C9A96E]/25 bg-[#2A1810]/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] md:p-8"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                    BookCircle Club
                  </p>
                  <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
                    {club.name}
                  </h1>
                </div>
                <span className="inline-flex whitespace-nowrap items-center gap-1 rounded-full border border-[#C9A96E]/35 px-3 py-1.5 text-[11px] uppercase tracking-wide text-[#C9A96E]">
                  {club.isPublic ? (
                    <Globe className="h-3.5 w-3.5" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                  {club.isPublic ? "Public" : "Private"}
                </span>
              </div>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#F2E8D9]/80">
                {club.description || "No description available."}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                {isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        club.isMember
                          ? onLeavePressed()
                          : pendingRequest
                            ? void handleCancelJoinRequestClick(club)
                            : club.isPublic || !pendingRequest
                              ? void handleJoinClick(club)
                              : undefined
                      }
                      disabled={joiningClubId === club.id}
                      className="inline-flex items-center gap-2 rounded bg-[#C9A96E] px-5 py-3 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884] disabled:cursor-not-allowed disabled:opacity-70"
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
                            ? club.isPublic
                              ? "Joining..."
                              : "Requesting..."
                            : club.isPublic
                              ? "Join Club"
                              : "Request to Join"}
                    </button>
                    {pendingRequest && (
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A87C]/50 bg-[#E8A87C]/10 px-3 py-1.5">
                        <AlertCircle className="h-4 w-4 text-[#E8A87C]" />
                        <span className="text-xs text-[#E8A87C]">
                          Pending Approval
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={`/auth/login?returnTo=${encodeURIComponent(`/clubs/${club.id}`)}`}
                    className="inline-flex items-center gap-2 rounded bg-[#C9A96E] px-5 py-3 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]"
                  >
                    Join Club
                  </Link>
                )}
                <span className="text-sm text-[#F2E8D9]/70">
                  Created {new Date(club.createdAt).toLocaleDateString()}
                </span>
              </div>

            </motion.div>

            {club.memberRole &&
              (club.memberRole === "OWNER" ||
                club.memberRole === "MODERATOR") &&
              !club.isPublic && (
                <JoinRequestsPanel
                  clubId={clubId}
                  requests={moderation.requests}
                  loading={moderation.loading}
                  actionInProgress={moderation.actionInProgress}
                  onApprove={moderation.approveRequest}
                  onReject={moderation.rejectRequest}
                  onRefresh={moderation.loadRequests}
                />
              )}

            {club.memberRole === "OWNER" && (
              <MembersPanel
                members={memberManagement.members}
                loading={memberManagement.loading}
                actionInProgress={memberManagement.actionInProgress}
                currentUserRole={club.memberRole}
                onPromote={memberManagement.promoteToModerator}
                onDemote={memberManagement.demoteToMember}
                onRefresh={loadMembers}
              />
            )}
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
    </main>
  );
}
