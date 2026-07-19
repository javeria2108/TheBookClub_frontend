"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  Search,
  Users,
} from "lucide-react";

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
import { useJoinClubAction } from "@/hooks/useJoinClubAction";
import { getClubs } from "@/lib/clubs";
import type { Club } from "@/lib/types";

type VisibilityFilter = "ALL" | "PUBLIC" | "PRIVATE";

const VISIBILITY_FILTERS: Array<{ label: string; value: VisibilityFilter }> = [
  { label: "All", value: "ALL" },
  { label: "Public", value: "PUBLIC" },
  { label: "Private", value: "PRIVATE" },
];

export default function ClubsPage() {
  const { isAuthenticated, isReady, logout, user } = useAuthState();
  const { toast } = useToast();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState<VisibilityFilter>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadClubs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await getClubs({
        page,
        limit: 9,
        search: search || undefined,
        isPublic:
          visibility === "ALL" ? undefined : visibility === "PUBLIC",
      });

      setClubs(data.clubs);
      setTotalPages(data.pagination.totalPages || 1);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load clubs";
      setError(message);
      toast({
        variant: "destructive",
        title: "Failed to load clubs",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, toast, visibility]);

  useEffect(() => {
    void loadClubs();
  }, [loadClubs]);

  const { joiningClubId, joinClub, cancelJoinRequest } =
    useJoinClubAction<Club>({
      isAuthenticated,
      onSuccess: (updatedClub, memberCount, action) => {
        setClubs((current) =>
          current.map((club) =>
            club.id === updatedClub.id
              ? {
                  ...club,
                  memberCount,
                  isMember: action === "join" && updatedClub.isPublic,
                  hasPendingJoinRequest:
                    action === "join" && !updatedClub.isPublic
                      ? true
                      : action === "cancel"
                        ? false
                        : club.hasPendingJoinRequest,
                }
              : club,
          ),
        );
      },
    });

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "R";

  const genres = useMemo(
    () => Array.from(new Set(clubs.map((club) => club.genre).filter(Boolean))),
    [clubs],
  );

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
          eyebrow="Discover"
          title="Discover clubs"
          description="Find a reading circle that matches your interests, pace, and preferred kind of conversation."
        />

        <form
          onSubmit={handleSearchSubmit}
          className="app-surface mb-6 rounded-2xl p-4"
        >
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-accent-gold)]" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by club name, genre, or description"
                className="app-input w-full py-3 pl-10 pr-3 text-sm"
              />
            </div>
            <button type="submit" className="app-button-primary">
              Search
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {VISIBILITY_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => {
                  setPage(1);
                  setVisibility(filter.value);
                }}
                className={`min-h-10 rounded-full border px-4 text-sm ${
                  visibility === filter.value
                    ? "border-[var(--app-accent-gold)] bg-[var(--app-accent-teal-soft)] text-[var(--app-accent-gold-hover)]"
                    : "border-[var(--app-border-subtle)] text-[var(--app-text-secondary)]"
                }`}
              >
                {filter.label}
              </button>
            ))}
            {genres.slice(0, 4).map((genre) => (
              <span
                key={genre}
                className="inline-flex min-h-10 items-center rounded-full border border-[var(--app-border-subtle)] px-4 text-sm text-[var(--app-text-muted)]"
              >
                {genre}
              </span>
            ))}
          </div>
        </form>

        {error ? (
          <ErrorState
            title="Unable to load clubs"
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
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-96 animate-pulse rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)]"
              />
            ))}
          </div>
        ) : clubs.length === 0 ? (
          <EmptyState
            title="No clubs found"
            description="Try another search term, clear the visibility filter, or come back when more circles have opened."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {clubs.map((club) => {
              const pendingRequest = Boolean(club.hasPendingJoinRequest);
              const isBusy = joiningClubId === club.id;
              const actionLabel = club.isMember
                ? "Open club"
                : pendingRequest
                  ? "Request pending"
                  : club.isPublic
                    ? "Join"
                    : "Request to join";

              return (
                <article
                  key={club.id}
                  className="app-surface group flex min-w-0 flex-col overflow-hidden rounded-2xl transition hover:border-[var(--app-border-strong)]"
                >
                  <CoverImage
                    src={club.coverImage}
                    alt={`${club.name} cover`}
                    className="aspect-[16/10]"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <StatusBadge tone={club.isPublic ? "teal" : "gold"}>
                        {club.isPublic ? (
                          <Globe className="h-3.5 w-3.5" />
                        ) : (
                          <Lock className="h-3.5 w-3.5" />
                        )}
                        {club.isPublic ? "Public" : "Private"}
                      </StatusBadge>
                      {club.isMember ? <StatusBadge tone="success">Joined</StatusBadge> : null}
                      {pendingRequest ? <StatusBadge tone="gold">Pending</StatusBadge> : null}
                    </div>
                    <h2 className="break-words font-serif text-2xl leading-tight">
                      {club.name}
                    </h2>
                    <p className="mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[var(--app-text-secondary)]">
                      {club.description || "No description yet."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--app-text-secondary)]">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-4 w-4 text-[var(--app-accent-gold)]" />
                        {club.memberCount ?? 0} readers
                      </span>
                      <span>{club.genre || "General"}</span>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--app-border-subtle)] pt-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-text-muted)]">
                        Reading details inside
                      </p>
                      {club.isMember ? (
                        <Link href={`/clubs/${club.id}`} className="app-button-primary">
                          <BookOpen className="h-4 w-4" />
                          {actionLabel}
                        </Link>
                      ) : pendingRequest ? (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void cancelJoinRequest(club)}
                          className="app-button-secondary"
                        >
                          {isBusy ? "Cancelling..." : "Cancel request"}
                        </button>
                      ) : isAuthenticated ? (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void joinClub(club)}
                          className="app-button-primary"
                        >
                          {isBusy ? "Working..." : actionLabel}
                        </button>
                      ) : (
                        <Link
                          href={`/auth/login?returnTo=${encodeURIComponent(`/clubs/${club.id}`)}`}
                          className="app-button-primary"
                        >
                          {actionLabel}
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((current) => current - 1)}
            className="app-button-secondary disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <span className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface)] px-4 text-sm text-[var(--app-text-secondary)]">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((current) => current + 1)}
            className="app-button-secondary disabled:cursor-not-allowed disabled:opacity-45"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
}
