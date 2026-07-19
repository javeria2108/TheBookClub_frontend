"use client";

import { CalendarDays, Edit3, Mail } from "lucide-react";

import type { UserProfile } from "@/lib/types";

type ProfileHeaderProps = {
  profile: UserProfile;
  onEdit: () => void;
};

function formatMemberSince(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function getInitial(username: string): string {
  return username.trim().charAt(0).toUpperCase() || "R";
}

export function ProfileHeader({ profile, onEdit }: ProfileHeaderProps) {
  return (
    <section className="app-surface-elevated relative overflow-hidden rounded-2xl p-6 md:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(26,165,156,0.20),transparent_32%),radial-gradient(circle_at_86%_18%,rgba(216,181,109,0.12),transparent_28%)]" />
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--app-border-strong)] bg-[var(--app-surface-subtle)] text-5xl font-semibold text-[var(--app-accent-gold)] shadow-[inset_0_1px_0_rgba(244,234,216,0.08)]">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={`${profile.username}'s avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitial(profile.username)
            )}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--app-accent-gold)]">
              Reader Profile
            </p>
            <h1 className="mt-2 break-words font-serif text-4xl font-bold leading-tight text-[var(--app-text-primary)] md:text-5xl">
              {profile.username}
            </h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--app-text-secondary)]">
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-[var(--app-accent-gold)]" />
                {profile.email}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[var(--app-accent-gold)]" />
                Member since {formatMemberSince(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="app-button-primary"
        >
          <Edit3 className="h-4 w-4" />
          Edit Profile
        </button>
      </div>
    </section>
  );
}
