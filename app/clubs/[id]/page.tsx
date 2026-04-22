"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronLeft, Globe, Lock, Users } from "lucide-react";
import Link from "next/link";
import type { Club } from "@/lib/types";
import { getClubById } from "@/lib/clubs";

export default function ClubDetailPage() {
  const params = useParams();
  const clubId = params.id as string;

  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadClub = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getClubById(clubId);
        setClub(response.club);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch club");
      } finally {
        setIsLoading(false);
      }
    };

    loadClub();
  }, [clubId]);

  return (
    <main className="min-h-screen bg-[#1A0F07] text-[#F2E8D9]">
      <section className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-12">
        <Link
          href="/clubs"
          className="inline-flex items-center gap-2 mb-8 text-[#C9A96E] hover:text-[#d8b884] transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Clubs
        </Link>

        {isLoading ? (
          <div className="rounded-2xl border border-[#C9A96E]/20 bg-[#2A1810] p-8 text-center">
            <p className="text-lg">Loading club...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[#8B4A3C]/60 bg-[#8B4A3C]/20 p-6">
            <p className="text-[#F2E8D9]">{error}</p>
          </div>
        ) : club ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="rounded-2xl border border-[#C9A96E]/25 bg-[#2A1810]/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] md:p-8"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                  BookCircle Club
                </p>
                <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
                  {club.name}
                </h1>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#C9A96E]/35 px-3 py-1.5 text-[11px] uppercase tracking-wide text-[#C9A96E] whitespace-nowrap">
                {club.isPublic ? (
                  <Globe className="h-3.5 w-3.5" />
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )}
                {club.isPublic ? "Public" : "Private"}
              </span>
            </div>

            <p className="mt-4 text-base text-[#F2E8D9]/80 leading-relaxed max-w-2xl">
              {club.description || "No description available."}
            </p>

            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <button className="inline-flex items-center gap-2 rounded bg-[#C9A96E] px-5 py-3 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]">
                Join Club
              </button>
              <span className="text-sm text-[#F2E8D9]/70">
                Created {new Date(club.createdAt).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ) : null}
      </section>
    </main>
  );
}
