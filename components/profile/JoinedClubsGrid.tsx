"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, Globe, Lock, Users } from "lucide-react";

import type { JoinedClubSummary } from "@/lib/types";

type JoinedClubsGridProps = {
  clubs: JoinedClubSummary[];
};

export function JoinedClubsGrid({ clubs }: JoinedClubsGridProps) {
  if (clubs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#C9A96E]/30 bg-[#2A1810]/75 p-8 text-center">
        <BookOpen className="mx-auto mb-4 h-9 w-9 text-[#C9A96E]" />
        <h2 className="font-serif text-2xl text-[#F2E8D9]">No clubs yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#F2E8D9]/70">
          Join a reading circle to make your profile feel lived in.
        </p>
        <Link
          href="/clubs"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#C9A96E] px-4 py-2 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]"
        >
          Discover Clubs
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {clubs.map((club) => (
        <article
          key={club.id}
          className="group overflow-hidden rounded-xl border border-[#C9A96E]/20 bg-[#2A1810] shadow-[0_18px_45px_rgba(0,0,0,0.3)] transition hover:-translate-y-1 hover:border-[#C9A96E]/55"
        >
          <div className="relative h-32 bg-[#100904]">
            {club.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={club.coverImage}
                alt=""
                className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(201,169,110,0.24),transparent_38%),linear-gradient(135deg,#3A2114,#100904)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F07]/90 to-transparent" />
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#100904]/80 px-3 py-1 text-xs text-[#F2E8D9]">
              {club.isPublic ? (
                <Globe className="h-3.5 w-3.5 text-[#C9A96E]" />
              ) : (
                <Lock className="h-3.5 w-3.5 text-[#C9A96E]" />
              )}
              {club.isPublic ? "Public" : "Private"}
            </span>
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-serif text-2xl leading-tight text-[#F2E8D9]">
                {club.name}
              </h3>
              <span className="rounded-full border border-[#C9A96E]/25 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#C9A96E]">
                {club.memberRole.toLowerCase()}
              </span>
            </div>
            <p className="mt-2 line-clamp-3 min-h-14 text-sm text-[#F2E8D9]/70">
              {club.description || "This club has not added a description yet."}
            </p>
            <div className="mt-5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-xs text-[#F2E8D9]/65">
                <Users className="h-3.5 w-3.5 text-[#C9A96E]" />
                {club.memberCount} readers
              </span>
              <Link
                href={`/clubs/${club.id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#C9A96E] transition hover:text-[#d8b884]"
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
