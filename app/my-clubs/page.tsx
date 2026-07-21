"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Globe, Lock, Plus, Search, Users } from "lucide-react";

import { CreateClubModal } from "@/components/clubs/CreateClubModal";
import { AppHeader } from "@/components/layout/AppHeader";
import {
  CoverImage,
  EmptyState,
  ErrorState,
  PageHeader,
  StatusBadge,
} from "@/components/ui/app-primitives";
import { useToast } from "@/components/ui/use-toast";
import { useAuthState } from "@/hooks/useAuthState";
import { getMyClubs } from "@/lib/clubs";
import type { Club } from "@/lib/types";

type ClubFilter = "ALL" | "OWNED" | "JOINED" | "PRIVATE";

const FILTERS: Array<{ label: string; value: ClubFilter }> = [
  { label: "All", value: "ALL" },
  { label: "Owned", value: "OWNED" },
  { label: "Joined", value: "JOINED" },
  { label: "Private", value: "PRIVATE" },
];

function getCurrentReadLabel(club: Club) {
  const cycle = club.currentReadingCycle;

  if (!cycle) return "No current read announced yet.";

  return `${cycle.status === "ACTIVE" ? "Currently reading" : "Planning"} ${cycle.book.title}`;
}

export default function MyClubsPage() {
  const router = useRouter();
  const { isAuthenticated, isReady, logout, user } = useAuthState();
  const { toast } = useToast();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeFilter, setActiveFilter] = useState<ClubFilter>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadClubs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await getMyClubs();
      setClubs(data.clubs);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load your clubs";
      setError(message);
      toast({
        variant: "destructive",
        title: "Failed to load clubs",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated) {
      router.replace("/auth/login?returnTo=/my-clubs");
      return;
    }

    void loadClubs();
  }, [isAuthenticated, isReady, loadClubs, router]);

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "R";

  const filteredClubs = useMemo(() => {
    const term = searchInput.trim().toLowerCase();
    return clubs.filter((club) => {
      const matchesSearch =
        !term ||
        club.name.toLowerCase().includes(term) ||
        club.description?.toLowerCase().includes(term) ||
        club.genre?.toLowerCase().includes(term);

      const matchesFilter =
        activeFilter === "ALL" ||
        (activeFilter === "OWNED" && club.memberRole === "OWNER") ||
        (activeFilter === "JOINED" && club.memberRole !== "OWNER") ||
        (activeFilter === "PRIVATE" && !club.isPublic);

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, clubs, searchInput]);

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
          eyebrow="Your circles"
          title="My Clubs"
          description="Open the reading rooms you belong to, see your role, and continue where the conversation is happening."
          action={
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="app-button-secondary"
            >
              <Plus className="h-4 w-4" />
              Create club
            </button>
          }
        />

        <div className="app-surface mb-6 min-w-0 rounded-2xl p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-accent-gold)]" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search clubs"
                className="app-input app-input-with-leading-icon w-full py-3 pr-3 text-sm"
              />
            </div>
            <div className="flex max-w-full flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`min-h-10 shrink-0 whitespace-nowrap rounded-full border px-4 text-sm ${
                    activeFilter === filter.value
                      ? "border-[var(--app-accent-gold)] bg-[var(--app-accent-teal-soft)] text-[var(--app-accent-gold-hover)]"
                      : "border-[var(--app-border-subtle)] text-[var(--app-text-secondary)]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error ? (
          <ErrorState
            title="Unable to load your clubs"
            description={error}
            action={
              <button
                type="button"
                onClick={() => void loadClubs()}
                className="app-button-primary"
              >
                Try again
              </button>
            }
          />
        ) : isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)]"
              />
            ))}
          </div>
        ) : filteredClubs.length === 0 ? (
          <EmptyState
            title={clubs.length === 0 ? "No clubs yet" : "No matching clubs"}
            description={
              clubs.length === 0
                ? "Discover an existing circle or create a quiet place for your first shared read."
                : "Try another search term or clear the current filter."
            }
            action={
              clubs.length === 0 ? (
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
              ) : null
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredClubs.map((club) => (
              <article
                key={club.id}
                className="app-surface group grid min-w-0 gap-4 overflow-hidden rounded-2xl p-4 transition hover:border-[var(--app-border-strong)] sm:grid-cols-[112px_1fr]"
              >
                <CoverImage
                  src={club.coverImage}
                  alt={`${club.name} cover`}
                  className="aspect-[4/3] rounded-xl sm:aspect-square"
                />
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                    <h2 className="min-w-0 break-words font-serif text-2xl leading-tight">
                      {club.name}
                    </h2>
                    <StatusBadge tone={club.memberRole === "OWNER" ? "gold" : "teal"}>
                      {club.memberRole === "OWNER" ? "Owner" : "Member"}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--app-text-secondary)]">
                    {club.description || "No description yet."}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[var(--app-text-secondary)]">
                    <StatusBadge tone="muted">
                      {club.isPublic ? (
                        <Globe className="h-3.5 w-3.5" />
                      ) : (
                        <Lock className="h-3.5 w-3.5" />
                      )}
                      {club.isPublic ? "Public" : "Private"}
                    </StatusBadge>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-4 w-4 text-[var(--app-accent-gold)]" />
                      {club.memberCount ?? 0} readers
                    </span>
                    <span>{club.genre || "General"}</span>
                  </div>
                  <div className="mt-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <p className="min-w-0 break-words text-xs uppercase tracking-[0.12em] text-[var(--app-text-muted)] sm:tracking-[0.16em]">
                      {getCurrentReadLabel(club)}
                    </p>
                    <Link href={`/clubs/${club.id}`} className="app-button-primary w-full sm:w-auto">
                      <BookOpen className="h-4 w-4" />
                      Open club
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <CreateClubModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={loadClubs}
      />
    </main>
  );
}
