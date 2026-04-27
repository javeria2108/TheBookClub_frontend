"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Globe, Lock, Users } from "lucide-react";
import type { LandingClub } from "@/lib/types";

interface DiscoverSectionProps {
  clubs: LandingClub[];
  isAuthenticated: boolean;
  onJoinClick: (club: LandingClub) => void;
  joiningClubId?: string | null;
  feedbackMessage?: string | null;
}

const cardReveal = {
  hidden: { opacity: 0, y: 18 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: index * 0.08 },
  }),
};

export function DiscoverSection({
  clubs,
  isAuthenticated,
  onJoinClick,
  joiningClubId,
  feedbackMessage,
}: DiscoverSectionProps) {
  return (
    <section id="discover" className="px-5 pb-24 md:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-5xl md:text-6xl"
        >
          Explore Clubs
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.06 }}
          className="mt-4 max-w-2xl text-[#F2E8D9]/75"
        >
          Public & private clubs — browse freely, join when ready.
        </motion.p>

        {feedbackMessage ? (
          <div className="mt-5 rounded border border-[#C9A96E]/25 bg-[#2A1810] px-4 py-3 text-sm text-[#F2E8D9]/80">
            {feedbackMessage}
          </div>
        ) : null}

        <div className="mt-10 flex gap-5 overflow-x-auto pb-2">
          {clubs.map((club, index) => (
            <motion.article
              key={club.id}
              variants={cardReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={index}
              whileHover={{ y: -6 }}
              className="min-w-72 max-w-80 flex-1 rounded-xl border border-[#C9A96E]/25 bg-[#2A1810] shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
            >
              <div className="relative h-44 overflow-hidden rounded-t-xl">
                <Image
                  src={club.coverImage}
                  alt={club.name}
                  fill
                  className="object-cover"
                />
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#1A0F07]/80 px-3 py-1 text-xs text-[#F2E8D9]">
                  {club.isPrivate ? (
                    <Lock className="h-3 w-3 text-[#C9A96E]" />
                  ) : (
                    <Globe className="h-3 w-3 text-[#C9A96E]" />
                  )}
                  {club.isPrivate ? "Private 🔒" : "Public"}
                </span>
              </div>
              <div className="space-y-4 p-5">
                <h3 className="font-serif text-2xl">{club.name}</h3>
                <p className="line-clamp-2 text-sm text-[#F2E8D9]/70">
                  {club.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-[#C9A96E]">
                  <Users className="h-4 w-4" />
                  <span>{club.memberCount} members</span>
                </div>
                <span className="inline-block rounded-full bg-[#8B4A3C]/30 px-3 py-1 text-xs text-[#F2E8D9]">
                  {club.genre}
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href={`/clubs/${club.id}`}
                    className="rounded border border-[#C9A96E]/40 px-3 py-2 text-center text-sm transition hover:bg-[#C9A96E]/10"
                  >
                    View Club
                  </Link>
                  <button
                    type="button"
                    onClick={() => onJoinClick(club)}
                    disabled={joiningClubId === club.id}
                    className="rounded bg-[#C9A96E] px-3 py-2 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {joiningClubId === club.id
                      ? "Joining..."
                      : club.isPrivate
                        ? "Request"
                        : "Join"}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-7">
          <Link
            href="/clubs"
            className="inline-flex items-center gap-1 text-sm text-[#C9A96E] transition hover:text-[#e4c591]"
          >
            View all clubs <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
