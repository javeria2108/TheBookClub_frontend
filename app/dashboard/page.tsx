"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Compass,
  MessageCircle,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";

import { CreateClubModal } from "@/components/clubs/CreateClubModal";
import { AppHeader } from "@/components/layout/AppHeader";
import {
  CoverImage,
  EmptyState,
  ErrorState,
  PageHeader,
  SectionHeader,
  StatusBadge,
} from "@/components/ui/app-primitives";
import { useToast } from "@/components/ui/use-toast";
import { useAuthState } from "@/hooks/useAuthState";
import { getMyClubs } from "@/lib/clubs";
import { getCurrentReadingCycle } from "@/lib/reading-cycles";
import type { Club, ReadingCycle } from "@/lib/types";

type ClubCycle = {
  club: Club;
  cycle: ReadingCycle | null;
};

function getGreeting(name?: string | null) {
  const hour = new Date().getHours();
  const time =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${time}${name ? `, ${name}` : ""}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getDaysRemaining(targetEndDate: string) {
  const endDate = new Date(targetEndDate);
  const today = new Date();
  const days = Math.ceil(
    (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0) return "Target date passed";
  if (days === 0) return "Ends today";
  if (days === 1) return "1 day remaining";
  return `${days} days remaining`;
}

export default function DashboardPage() {
  const { isAuthenticated, isReady, logout, user } = useAuthState();
  const { toast } = useToast();
  const [clubCycles, setClubCycles] = useState<ClubCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadHome = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await getMyClubs();
      const cycles = await Promise.all(
        data.clubs.map(async (club) => {
          try {
            return {
              club,
              cycle: await getCurrentReadingCycle(club.id),
            };
          } catch {
            return { club, cycle: null };
          }
        }),
      );
      setClubCycles(cycles);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load your home";
      setError(message);
      toast({
        variant: "destructive",
        title: "Failed to load home",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isReady || !isAuthenticated) return;
    void loadHome();
  }, [isAuthenticated, isReady, loadHome]);

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "R";
  const activeCycles = useMemo(
    () => clubCycles.filter((item) => item.cycle?.status === "ACTIVE"),
    [clubCycles],
  );
  const featuredCycle = activeCycles[0] ?? clubCycles.find((item) => item.cycle);
  const clubs = clubCycles.map((item) => item.club);

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
        <PageHeader
          eyebrow="Home"
          title={getGreeting(user?.name)}
          description="Continue your journey through the reading circles you have joined."
          action={
            <>
              <Link href="/clubs" className="app-button-primary">
                <Compass className="h-4 w-4" />
                Discover clubs
              </Link>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="app-button-secondary"
              >
                <Plus className="h-4 w-4" />
                Create club
              </button>
            </>
          }
        />

        {error ? (
          <ErrorState
            title="Unable to load Home"
            description={error}
            action={
              <button
                type="button"
                onClick={() => void loadHome()}
                className="app-button-primary"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            }
          />
        ) : isLoading ? (
          <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="h-80 animate-pulse rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)]" />
            <div className="h-80 animate-pulse rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)]" />
          </div>
        ) : clubs.length === 0 ? (
          <EmptyState
            title="Your reading circle is waiting"
            description="BookCircle begins when you join a club or create a quiet room for readers who care about the same books."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/clubs" className="app-button-primary">
                  Discover clubs
                </Link>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="app-button-secondary"
                >
                  Create club
                </button>
              </div>
            }
          />
        ) : (
          <div className="space-y-8">
            <section>
              <SectionHeader
                title="Continue Reading"
                description="The most relevant active or planned read across your circles."
              />
              {featuredCycle?.cycle ? (
                <article className="app-surface-elevated grid gap-6 rounded-2xl p-5 lg:grid-cols-[180px_1fr] lg:p-6">
                  <CoverImage
                    src={featuredCycle.cycle.book.coverImage}
                    alt={`${featuredCycle.cycle.book.title} cover`}
                    className="aspect-[2/3] rounded-xl"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge tone={featuredCycle.cycle.status === "ACTIVE" ? "teal" : "gold"}>
                        {featuredCycle.cycle.status === "ACTIVE"
                          ? "Currently reading"
                          : "Up next"}
                      </StatusBadge>
                      <StatusBadge tone="muted">{featuredCycle.club.name}</StatusBadge>
                    </div>
                    <h2 className="mt-4 break-words font-serif text-3xl leading-tight md:text-4xl">
                      {featuredCycle.cycle.book.title}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--app-text-secondary)]">
                      {featuredCycle.cycle.book.authors.length > 0
                        ? featuredCycle.cycle.book.authors.join(", ")
                        : "Unknown author"}
                    </p>
                    <p className="mt-4 text-sm text-[var(--app-text-secondary)]">
                      {formatDate(featuredCycle.cycle.startDate)} to{" "}
                      {formatDate(featuredCycle.cycle.targetEndDate)} |{" "}
                      {getDaysRemaining(featuredCycle.cycle.targetEndDate)}
                    </p>
                    {featuredCycle.cycle.goalDescription ? (
                      <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--app-text-secondary)]">
                        {featuredCycle.cycle.goalDescription}
                      </p>
                    ) : null}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href={`/clubs/${featuredCycle.club.id}/reading`}
                        className="app-button-primary"
                      >
                        <BookOpen className="h-4 w-4" />
                        Open Reading
                      </Link>
                      <Link
                        href={`/clubs/${featuredCycle.club.id}/discussion`}
                        className="app-button-secondary"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Open Discussion
                      </Link>
                    </div>
                  </div>
                </article>
              ) : (
                <EmptyState
                  title="No active reads yet"
                  description="Your clubs have not announced a current read. Open a club to see what is being planned."
                  action={
                    <Link href="/my-clubs" className="app-button-primary">
                      View My Clubs
                    </Link>
                  }
                />
              )}
            </section>

            <section>
              <SectionHeader
                title="Your Circles"
                description={`${clubs.length} joined ${clubs.length === 1 ? "club" : "clubs"}`}
                action={
                  <Link href="/my-clubs" className="app-button-secondary">
                    View all
                  </Link>
                }
              />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {clubCycles.slice(0, 6).map(({ club, cycle }) => (
                  <article key={club.id} className="app-surface rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="break-words font-serif text-2xl leading-tight">
                        {club.name}
                      </h3>
                      <StatusBadge tone={club.memberRole === "OWNER" ? "gold" : "muted"}>
                        {club.memberRole === "OWNER" ? "Owner" : "Member"}
                      </StatusBadge>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--app-text-secondary)]">
                      {cycle
                        ? `${cycle.status === "ACTIVE" ? "Currently reading" : "Planning"} ${cycle.book.title}`
                        : "No active read announced yet."}
                    </p>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1 text-sm text-[var(--app-text-secondary)]">
                        <Users className="h-4 w-4 text-[var(--app-accent-gold)]" />
                        {club.memberCount ?? 0}
                      </span>
                      <Link href={`/clubs/${club.id}`} className="app-button-secondary">
                        Open club
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </section>

      <CreateClubModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={loadHome}
      />
    </main>
  );
}
