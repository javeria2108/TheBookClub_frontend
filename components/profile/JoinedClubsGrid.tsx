"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, Globe, Lock, Users } from "lucide-react";

import { CoverImage, EmptyState, StatusBadge } from "@/components/ui/app-primitives";
import type { JoinedClubSummary } from "@/lib/types";

type JoinedClubsGridProps = {
  clubs: JoinedClubSummary[];
};

export function JoinedClubsGrid({ clubs }: JoinedClubsGridProps) {
  if (clubs.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="h-6 w-6" />}
        title="No clubs yet"
        description="Join a reading circle to make your profile feel lived in."
        action={
        <Link
          href="/clubs"
          className="app-button-primary"
        >
          Discover Clubs
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {clubs.map((club) => (
        <article
          key={club.id}
          className="app-surface group overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:border-[var(--app-border-strong)]"
        >
          <CoverImage
            src={club.coverImage}
            alt={`${club.name} cover`}
            className="h-36 transition duration-500 group-hover:scale-[1.02]"
          />

          <div className="min-w-0 p-4 sm:p-5">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
              <h3 className="break-words font-serif text-2xl leading-tight text-[var(--app-text-primary)]">
                {club.name}
              </h3>
              <StatusBadge tone={club.memberRole === "OWNER" ? "gold" : "muted"}>
                {club.memberRole.toLowerCase()}
              </StatusBadge>
            </div>
            <p className="mt-2 line-clamp-3 min-h-14 text-sm text-[var(--app-text-secondary)]">
              {club.description || "This club has not added a description yet."}
            </p>
            <div className="mt-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={club.isPublic ? "teal" : "gold"}>
                  {club.isPublic ? (
                    <Globe className="h-3.5 w-3.5" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                  {club.isPublic ? "Public" : "Private"}
                </StatusBadge>
                <span className="inline-flex items-center gap-1 text-xs text-[var(--app-text-secondary)]">
                  <Users className="h-3.5 w-3.5 text-[var(--app-accent-gold)]" />
                  {club.memberCount} readers
                </span>
              </div>
              <Link
                href={`/clubs/${club.id}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--app-accent-gold)] transition hover:text-[var(--app-accent-gold-hover)]"
              >
                Open
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
