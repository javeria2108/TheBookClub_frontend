"use client";

import { CreateClubModal } from "@/components/clubs/CreateClubModal";
import { getMyClubs } from "@/lib/clubs";
import { AppHeader } from "@/components/layout/AppHeader";
import type { Club } from "@/lib/types";
import {
  ArrowUpRight,
  BookOpen,
  Globe,
  Lock,
  Plus,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuthState } from "@/hooks/useAuthState";
import { useToast } from "@/components/ui/use-toast";

export default function DashboardPage() {
  const { isAuthenticated, isReady, user } = useAuthState();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const loadClubs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await getMyClubs();
      setClubs(data.clubs);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load clubs";
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
    if (!isReady) {
      return;
    }

    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    loadClubs();
  }, [isAuthenticated, isReady, loadClubs]);

  const handleClubCreated = async () => {
    await loadClubs();
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "R";

  const filteredClubs = useMemo(() => {
    const term = searchInput.trim().toLowerCase();
    if (!term) return clubs;
    return clubs.filter((club) => club.name.toLowerCase().includes(term));
  }, [clubs, searchInput]);

  const totalMembers = useMemo(
    () => clubs.reduce((total, club) => total + (club.memberCount ?? 0), 0),
    [clubs],
  );

  return (
    <main className="min-h-screen bg-[#1A0F07] text-[#F2E8D9]">
      <AppHeader
        mode="app"
        isAuthenticated={isAuthenticated}
        userInitial={userInitial}
      />

      <section className="relative mx-auto w-full max-w-7xl px-5 pb-12 pt-28 md:px-8">
        <div className="pointer-events-none absolute inset-x-5 top-24 h-72 overflow-hidden rounded-[28px] opacity-70 md:inset-x-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,169,110,0.22),transparent_32%),linear-gradient(135deg,#2A1810,#1A0F07_58%,#8B4A3C)]" />
          <div className="absolute inset-0 bg-[#1A0F07]/35" />
        </div>

        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative mb-6 overflow-hidden rounded-2xl border border-[#C9A96E]/25 bg-[#100904]/80 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur md:p-8"
        >
          <div className="absolute right-0 top-0 h-full w-1/2 bg-[linear-gradient(120deg,transparent,rgba(201,169,110,0.08))]" />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                Your Reading Space
              </p>
              <h1 className="mt-3 font-serif text-5xl leading-none md:text-6xl">
                Welcome back{user?.name ? `, ${user.name}` : ""}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[#F2E8D9]/75 md:text-base">
                Pick up the clubs you care about, keep conversations moving,
                and shape the next reading circle without wading through noise.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/clubs"
                className="inline-flex items-center gap-2 rounded border border-[#C9A96E]/40 px-4 py-2 text-sm text-[#F2E8D9] transition hover:border-[#C9A96E] hover:text-[#C9A96E]"
              >
                <Search className="h-4 w-4" />
                Discover Clubs
              </Link>

              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 rounded bg-[#C9A96E] px-4 py-2 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]"
              >
                <Plus className="h-4 w-4" />
                Create Club
              </button>
            </div>
          </div>
        </motion.header>

        <div className="relative mb-6 grid gap-3 md:grid-cols-3">
          {[
            { label: "Joined Clubs", value: clubs.length, icon: BookOpen },
            { label: "Readers Nearby", value: totalMembers, icon: Users },
            {
              label: "Private Circles",
              value: clubs.filter((club) => !club.isPublic).length,
              icon: Lock,
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-[#C9A96E]/20 bg-[#2A1810]/85 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
              >
                <Icon className="mb-3 h-5 w-5 text-[#C9A96E]" />
                <p className="font-serif text-4xl leading-none">{stat.value}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[#F2E8D9]/55">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06 }}
          className="relative mb-8 rounded-xl border border-[#C9A96E]/20 bg-[#100904]/80 p-4"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A96E]/70" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search your recent clubs..."
              className="w-full rounded border border-[#C9A96E]/30 bg-[#1A0F07] py-3 pl-10 pr-3 text-sm text-[#F2E8D9] placeholder:text-[#F2E8D9]/40 focus:border-[#C9A96E] focus:outline-none"
            />
          </div>
        </motion.section>

        {error ? (
          <div className="mb-4 rounded-2xl border border-[#8B4A3C]/60 bg-[#8B4A3C]/15 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[#F2E8D9]">Unable to load clubs</p>
                <p className="text-sm text-[#F2E8D9]/75">Try again in a moment.</p>
              </div>
              <button
                type="button"
                onClick={() => void loadClubs()}
                className="inline-flex items-center gap-2 rounded bg-[#C9A96E] px-4 py-2 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]"
              >
                Retry
              </button>
            </div>
          </div>
        ) : null}

        <section>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#C9A96E]" />
              <h2 className="font-serif text-3xl">My Clubs</h2>
            </div>
            <p className="hidden text-sm text-[#F2E8D9]/55 sm:block">
              {filteredClubs.length} shown
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-40 animate-pulse rounded-2xl border border-[#C9A96E]/20 bg-[#2A1810]"
                />
              ))}
            </div>
          ) : filteredClubs.length === 0 ? (
            <div className="overflow-hidden rounded-2xl border border-dashed border-[#C9A96E]/30 bg-[#2A1810]/75 p-8 text-center">
              <BookOpen className="mx-auto mb-4 h-9 w-9 text-[#C9A96E]" />
              <p className="font-serif text-2xl">
                {searchInput.trim()
                  ? "No matching clubs found"
                  : "No clubs yet"}
              </p>
              <p className="mt-2 text-sm text-[#F2E8D9]/70">
                {searchInput.trim()
                  ? "Try a different search term."
                  : "Create your first club to begin your reading journey."}
              </p>
              {!searchInput.trim() ? (
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded bg-[#C9A96E] px-4 py-2 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]"
                >
                  <Plus className="h-4 w-4" />
                  Create Club
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClubs.map((club, idx) => (
                <motion.article
                  key={club.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: idx * 0.05 }}
                  className="group overflow-hidden rounded-xl border border-[#C9A96E]/20 bg-[#2A1810] shadow-[0_18px_45px_rgba(0,0,0,0.3)] transition hover:-translate-y-1 hover:border-[#C9A96E]/55"
                >
                  <div className="relative h-36 bg-[#100904]">
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
                    <h3 className="font-serif text-2xl leading-tight">
                      {club.name}
                    </h3>
                    <p className="mt-2 line-clamp-3 min-h-14 text-sm text-[#F2E8D9]/75">
                      {club.description || "No description yet."}
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-xs text-[#F2E8D9]/65">
                        <Users className="h-3.5 w-3.5 text-[#C9A96E]" />
                        {club.memberCount ?? 0} readers
                      </span>
                      <Link
                        href={`/clubs/${club.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#C9A96E] transition hover:text-[#d8b884]"
                      >
                        Open Club
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </section>

      <CreateClubModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handleClubCreated}
      />
    </main>
  );
}
