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
    <section className="relative overflow-hidden rounded-2xl border border-[#C9A96E]/25 bg-[#100904]/85 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.45)] md:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(201,169,110,0.18),transparent_30%),linear-gradient(135deg,rgba(42,24,16,0.9),rgba(26,15,7,0.85))]" />
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#C9A96E]/40 bg-[#2A1810] text-5xl font-semibold text-[#C9A96E]">
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
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
              Reader Profile
            </p>
            <h1 className="mt-2 font-serif text-5xl leading-none text-[#F2E8D9] md:text-6xl">
              {profile.username}
            </h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#F2E8D9]/70">
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#C9A96E]" />
                {profile.email}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#C9A96E]" />
                Member since {formatMemberSince(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C9A96E] px-4 py-2.5 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]"
        >
          <Edit3 className="h-4 w-4" />
          Edit Profile
        </button>
      </div>
    </section>
  );
}
