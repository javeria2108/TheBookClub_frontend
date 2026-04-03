"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getClubs } from "@/lib/clubs";
import type { Club } from "@/lib/types";
import { CreateClubModal } from "@/components/clubs/CreateClubModal";

export default function DashboardPage() {
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
      const data = await getClubs({ page: 1, limit: 6 });
      setClubs(data.clubs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clubs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const handleClubCreated = async () => {
    setSuccessMessage("Club created successfully");
    await loadClubs();
    setTimeout(() => setSuccessMessage(""), 2500);
  };

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-8">
      <section className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your reading circles, discover clubs, and create new ones.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" asChild>
              <Link href="/clubs">
                <Search size={16} />
                <span className="ml-2">Discover Clubs</span>
              </Link>
            </Button>

            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus size={16} />
              <span className="ml-2">Create Club</span>
            </Button>
          </div>
        </header>

        <div className="rounded-xl border border-border bg-card p-4">
          <label className="text-sm text-muted-foreground">Quick search</label>
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search your clubs..."
            className="mt-2"
          />
        </div>

        {successMessage && (
          <p className="text-sm text-green-500">{successMessage}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen size={20} className="text-accent" />
            Recent Clubs
          </h2>

          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : clubs.length === 0 ? (
            <p className="text-muted-foreground">
              No clubs yet. Create your first one.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clubs.map((club) => (
                <article
                  key={club.id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <h3 className="font-semibold">{club.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                    {club.description || "No description yet."}
                  </p>
                  <div className="mt-3 text-xs text-accent">
                    {club.isPublic ? "Public" : "Private"}
                  </div>
                </article>
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
