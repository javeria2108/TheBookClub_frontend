"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { getClubs } from "@/lib/clubs";
import { useAuthState } from "@/hooks/useAuthState";
import type { Club } from "@/lib/types";
import {
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

export default function ClubsPage() {
  const { isAuthenticated, isReady, logout, user } = useAuthState();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const loadClubs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getClubs({
        page,
        limit: 9,
        search: search || undefined,
      });

      setClubs(data.clubs);
      setTotalPages(data.pagination.totalPages || 1);
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
  }, [page, search, toast]);

  useEffect(() => {
    void loadClubs();
  }, [loadClubs]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "R";

  return (
    <main className="min-h-screen bg-[#1A0F07] text-[#F2E8D9]">
      <AppHeader
        mode="app"
        isAuthenticated={isAuthenticated}
        isAuthReady={isReady}
        userInitial={userInitial}
        onLogout={logout}
      />

      <section className="mx-auto w-full max-w-7xl px-5 pb-12 pt-28 md:px-8">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative mb-8 overflow-hidden rounded-2xl border border-[#C9A96E]/25 bg-[#2A1810]/90 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.42)] md:p-8"
        >
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_70%_20%,rgba(201,169,110,0.2),transparent_34%),linear-gradient(135deg,transparent,#8B4A3C)] opacity-70 md:block" />

          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                BookCircle Library
              </p>
              <h1 className="mt-3 font-serif text-5xl leading-none md:text-6xl">
                Discover Book Clubs
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[#F2E8D9]/75 md:text-base">
                Browse public and private reading circles with enough context
                to choose the kind of conversation you actually want to join.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded border border-[#C9A96E]/40 px-4 py-2 text-sm text-[#F2E8D9] transition hover:border-[#C9A96E] hover:text-[#C9A96E]"
            >
              Back to Dashboard
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="relative z-10 mt-7 flex flex-col gap-3 rounded-xl border border-[#C9A96E]/20 bg-[#100904]/60 p-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A96E]/70" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search clubs by name..."
                className="w-full rounded-lg border border-[#C9A96E]/30 bg-[#1A0F07] py-3 pl-10 pr-3 text-sm text-[#F2E8D9] placeholder:text-[#F2E8D9]/40 focus:border-[#C9A96E] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C9A96E] px-5 py-3 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]"
            >
              <Sparkles className="h-4 w-4" />
              Search
            </button>
          </form>
        </motion.header>

        {error ? (
          <div className="mb-6 rounded-2xl border border-[#8B4A3C]/60 bg-[#8B4A3C]/15 p-4">
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

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-xl border border-[#C9A96E]/20 bg-[#2A1810]"
              />
            ))}
          </div>
        ) : clubs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#C9A96E]/30 bg-[#2A1810]/80 p-10 text-center">
            <BookOpen className="mx-auto mb-4 h-10 w-10 text-[#C9A96E]" />
            <p className="font-serif text-2xl">No clubs found</p>
            <p className="mt-2 text-sm text-[#F2E8D9]/70">
              Try a different search term or clear your filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club, index) => (
              <motion.article
                key={club.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="group overflow-hidden rounded-xl border border-[#C9A96E]/20 bg-[#2A1810] shadow-[0_18px_45px_rgba(0,0,0,0.32)] transition hover:-translate-y-1 hover:border-[#C9A96E]/55"
              >
                <div className="relative h-44 bg-[#100904]">
                  {club.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={club.coverImage}
                      alt=""
                      className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(201,169,110,0.24),transparent_36%),linear-gradient(135deg,#3A2114,#100904)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F07]/95 via-[#1A0F07]/15 to-transparent" />
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#100904]/80 px-3 py-1 text-xs text-[#F2E8D9]">
                    {club.isPublic ? (
                      <Globe className="h-3.5 w-3.5 text-[#C9A96E]" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-[#C9A96E]" />
                    )}
                    {club.isPublic ? "Public" : "Private"}
                  </span>
                  <h2 className="absolute bottom-4 left-4 right-4 font-serif text-3xl leading-tight">
                    {club.name}
                  </h2>
                </div>

                <div className="p-5">
                  <p className="line-clamp-3 min-h-16 text-sm leading-relaxed text-[#F2E8D9]/75">
                    {club.description || "No description yet."}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-[#C9A96E]/15 pt-4">
                    <span className="inline-flex items-center gap-1 text-xs text-[#F2E8D9]/65">
                      <Users className="h-3.5 w-3.5 text-[#C9A96E]" />
                      {club.memberCount ?? 0} readers
                    </span>

                    <Link
                      href={`/clubs/${club.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#C9A96E] transition hover:text-[#d8b884]"
                    >
                      View Club
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((current) => current - 1)}
            className="inline-flex items-center gap-2 rounded border border-[#C9A96E]/35 px-4 py-2 text-sm text-[#F2E8D9] transition hover:border-[#C9A96E] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <span className="inline-flex items-center gap-2 rounded border border-[#C9A96E]/20 bg-[#2A1810] px-4 py-2 text-sm text-[#F2E8D9]/80">
            <BookOpen className="h-4 w-4 text-[#C9A96E]" />
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((current) => current + 1)}
            className="inline-flex items-center gap-2 rounded border border-[#C9A96E]/35 px-4 py-2 text-sm text-[#F2E8D9] transition hover:border-[#C9A96E] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
}
