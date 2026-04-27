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
import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ClubsPage() {
  const { isAuthenticated, user } = useAuthState();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
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
        setError(err instanceof Error ? err.message : "Failed to load clubs");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [page, search]);

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
            BookCircle
          </p>

          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="font-serif text-4xl leading-tight md:text-5xl">
                Discover Book Clubs
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[#F2E8D9]/75 md:text-base">
                Explore reading circles, find your next discussion, and join a
                community built around great books.
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
            className="mt-6 flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A96E]/70" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search clubs by name..."
                className="w-full rounded border border-[#C9A96E]/30 bg-[#1A0F07] py-3 pl-10 pr-3 text-sm text-[#F2E8D9] placeholder:text-[#F2E8D9]/40 focus:border-[#C9A96E] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded bg-[#C9A96E] px-5 py-3 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]"
            >
              Search
            </button>
          </form>
        </motion.header>

        {error ? (
          <p className="mb-6 rounded border border-[#8B4A3C]/60 bg-[#8B4A3C]/20 px-3 py-2 text-sm text-[#F2E8D9]">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-2xl border border-[#C9A96E]/20 bg-[#2A1810]"
              />
            ))}
          </div>
        ) : clubs.length === 0 ? (
          <div className="rounded-2xl border border-[#C9A96E]/20 bg-[#2A1810] p-8 text-center">
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
                className="group rounded-2xl border border-[#C9A96E]/20 bg-[#2A1810] p-5 transition hover:-translate-y-px hover:border-[#C9A96E]/45"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-serif text-2xl leading-tight">
                    {club.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#C9A96E]/35 px-2.5 py-1 text-[11px] uppercase tracking-wide text-[#C9A96E]">
                    {club.isPublic ? (
                      <Globe className="h-3.5 w-3.5" />
                    ) : (
                      <Lock className="h-3.5 w-3.5" />
                    )}
                    {club.isPublic ? "Public" : "Private"}
                  </span>
                </div>

                <p className="mt-3 line-clamp-3 text-sm text-[#F2E8D9]/75">
                  {club.description || "No description yet."}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs text-[#F2E8D9]/65">
                    <Users className="h-3.5 w-3.5 text-[#C9A96E]" />
                    Reading circle
                  </span>

                  <Link
                    href={`/clubs/${club.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#C9A96E] transition hover:text-[#d8b884]"
                  >
                    View Club
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
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
