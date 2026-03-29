"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getClubs } from "@/lib/clubs";
import { Club } from "@/lib/types";
import { BookOpen, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ClubsPage() {
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-10">
      <section className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center gap-3">
          <BookOpen className="text-accent" size={26} />
          <h1 className="text-3xl font-bold">Discover Book Clubs</h1>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none  absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by club name..."
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        {error && <p className="text-destructive text-sm">{error}</p>}

        {isLoading ? (
          <p className="text-muted-foreground">Loading clubs...</p>
        ) : clubs.length === 0 ? (
          <p className="text-muted-foreground">No clubs found</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => (
              <article
                key={club.id}
                className="rounded-xl border border-border bg-card p-5 shadow-md"
              >
                <h2 className="text-lg font-semibold">{club.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                  {club.description || "No description yet."}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-accent">
                    {club.isPublic ? "Public" : "Private"}
                  </span>
                  <Link
                    href={`/clubs/${club.id}`}
                    className="text-sm text-accent hover:underline"
                  >
                    View
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            variant="secondary"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </section>
    </main>
  );
}
