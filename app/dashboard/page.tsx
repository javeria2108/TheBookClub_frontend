"use client";

import { CreateClubModal } from "@/components/clubs/CreateClubModal";
import { getClubs, getMyClubs } from "@/lib/clubs";
import { AppHeader } from "@/components/layout/AppHeader";
import type { Club } from "@/lib/types";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuthState } from "@/hooks/useAuthState";

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuthState();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const loadClubs = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = isAuthenticated
        ? await getMyClubs()
        : await getClubs({ page: 1, limit: 6 });

      setClubs(data.clubs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clubs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // reload when auth state becomes available
    loadClubs();
  }, [isAuthenticated]);

  const handleClubCreated = async () => {
    setSuccessMessage("Club created successfully.");
    await loadClubs();
    setTimeout(() => setSuccessMessage(""), 2500);
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "R";

  const filteredClubs = useMemo(() => {
    const term = searchInput.trim().toLowerCase();
    if (!term) return clubs;
    return clubs.filter((club) => club.name.toLowerCase().includes(term));
  }, [clubs, searchInput]);

  return (
    <main className="min-h-screen bg-[#1A0F07] text-[#F2E8D9]">
      <AppHeader
        mode="app"
        isAuthenticated={isAuthenticated}
        userInitial={userInitial}
      />

      <section className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-12">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-8 rounded-2xl border border-[#C9A96E]/25 bg-[#2A1810]/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] md:p-8"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
            Your Reading Space
          </p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="font-serif text-4xl leading-tight md:text-5xl">
                Welcome back
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[#F2E8D9]/75 md:text-base">
                Manage your reading circles, discover communities, and create
                your next club gathering in seconds.
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

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06 }}
          className="mb-6 rounded-2xl border border-[#C9A96E]/20 bg-[#2A1810] p-5"
        >
          <label className="text-xs uppercase tracking-[0.18em] text-[#C9A96E]">
            Quick Search
          </label>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A96E]/70" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search your recent clubs..."
              className="w-full rounded border border-[#C9A96E]/30 bg-[#1A0F07] py-3 pl-10 pr-3 text-sm text-[#F2E8D9] placeholder:text-[#F2E8D9]/40 focus:border-[#C9A96E] focus:outline-none"
            />
          </div>
        </motion.section>

        {successMessage ? (
          <p className="mb-4 inline-flex items-center gap-2 rounded border border-[#3f8f5c]/50 bg-[#20432d]/35 px-3 py-2 text-sm text-[#daf5e4]">
            <CheckCircle2 className="h-4 w-4" />
            {successMessage}
          </p>
        ) : null}

        {error ? (
          <p className="mb-4 rounded border border-[#8B4A3C]/60 bg-[#8B4A3C]/20 px-3 py-2 text-sm text-[#F2E8D9]">
            {error}
          </p>
        ) : null}

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#C9A96E]" />
            <h2 className="font-serif text-3xl">Recent Clubs</h2>
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
            <div className="rounded-2xl border border-[#C9A96E]/20 bg-[#2A1810] p-8 text-center">
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClubs.map((club, idx) => (
                <motion.article
                  key={club.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: idx * 0.05 }}
                  className="group rounded-2xl border border-[#C9A96E]/20 bg-[#2A1810] p-5 transition hover:-translate-y-px hover:border-[#C9A96E]/45"
                >
                  <h3 className="font-serif text-2xl leading-tight">
                    {club.name}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-[#F2E8D9]/75">
                    {club.description || "No description yet."}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs text-[#F2E8D9]/65">
                      <BookOpen className="h-3.5 w-3.5 text-[#C9A96E]" />
                      {club.isPublic ? "Public" : "Private"}
                    </span>
                    <Link
                      href={`/clubs/${club.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#C9A96E] transition hover:text-[#d8b884]"
                    >
                      Open Club
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
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
