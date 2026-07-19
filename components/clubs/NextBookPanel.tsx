"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Crown, Plus, Vote } from "lucide-react";

import { BookSearchModal } from "@/components/books/BookSearchModal";
import { EmptyState, ErrorState, SectionHeader, StatusBadge } from "@/components/ui/app-primitives";
import { useToast } from "@/components/ui/use-toast";
import {
  cancelBookVoteRound,
  closeBookVoteRound,
  createBookVoteRound,
  getBookVoteRounds,
  nominateBook,
  openBookVoteRound,
  removeBookNomination,
  resolveBookVoteWinner,
  voteForBook,
} from "@/lib/book-votes";
import type { BookDiscoveryResult, BookVoteRound, Club } from "@/lib/types";

type NextBookPanelProps = {
  club: Club;
};

function formatDate(value: string | null): string {
  if (!value) return "No date set";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getAuthorsLabel(authors: string[]): string {
  return authors.length > 0 ? authors.join(", ") : "Unknown author";
}

export function NextBookPanel({ club }: NextBookPanelProps) {
  const { toast } = useToast();
  const [rounds, setRounds] = useState<BookVoteRound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pendingBook, setPendingBook] = useState<BookDiscoveryResult | null>(null);
  const [reason, setReason] = useState("");
  const [title, setTitle] = useState("Choose our next read");
  const [description, setDescription] = useState("");
  const [closesAt, setClosesAt] = useState("");

  const activeRound = useMemo(
    () =>
      rounds.find((round) => round.status === "OPEN") ??
      rounds.find((round) => round.status === "DRAFT") ??
      rounds[0] ??
      null,
    [rounds],
  );

  const loadRounds = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const nextRounds = await getBookVoteRounds(club.id);
      setRounds(nextRounds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load voting");
    } finally {
      setIsLoading(false);
    }
  }, [club.id]);

  useEffect(() => {
    void loadRounds();
  }, [loadRounds]);

  const replaceRound = (round: BookVoteRound) => {
    setRounds((current) => {
      const exists = current.some((item) => item.id === round.id);
      return exists
        ? current.map((item) => (item.id === round.id ? round : item))
        : [round, ...current];
    });
  };

  const runRoundAction = async (
    action: () => Promise<BookVoteRound>,
    success: string,
  ) => {
    try {
      setIsSaving(true);
      const round = await action();
      replaceRound(round);
      toast({ title: success });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Next-book action failed",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRound = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runRoundAction(
      () =>
        createBookVoteRound(club.id, {
          title,
          description: description || null,
          closesAt: closesAt ? new Date(closesAt).toISOString() : null,
        }),
      "Voting round created",
    );
    setShowCreate(false);
  };

  const handleNominate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeRound || !pendingBook) return;

    await runRoundAction(
      () =>
        nominateBook(club.id, activeRound.id, {
          bookId: pendingBook.bookId ?? undefined,
          googleBooksId: pendingBook.bookId ? undefined : pendingBook.googleBooksId ?? undefined,
          reason: reason || null,
        }),
      "Book nominated",
    );
    setPendingBook(null);
    setReason("");
  };

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-[var(--app-surface)]" />;
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load voting"
        description={error}
        action={<button type="button" onClick={() => void loadRounds()} className="app-button-secondary">Retry</button>}
      />
    );
  }

  return (
    <section className="space-y-5">
      <div className="app-surface-elevated min-w-0 overflow-hidden rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--app-accent-gold)]">
              Next Book
            </p>
            <h1 className="mt-2 break-words font-serif text-3xl leading-tight sm:text-4xl">
              Choose the next read
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-text-secondary)]">
              Nominate books, vote once, and let the club settle on the next shared reading cycle.
            </p>
          </div>
          {club.memberRole === "OWNER" ? (
            <button type="button" onClick={() => setShowCreate((value) => !value)} className="app-button-primary w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Create voting round
            </button>
          ) : null}
        </div>

        {showCreate ? (
          <form onSubmit={handleCreateRound} className="mt-5 grid gap-3 rounded-xl border border-[var(--app-border-subtle)] p-4 md:grid-cols-3">
            <label className="block text-sm font-semibold md:col-span-1">
              Title
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="app-input mt-1" required maxLength={140} />
            </label>
            <label className="block text-sm font-semibold md:col-span-1">
              Closes
              <input type="datetime-local" value={closesAt} onChange={(event) => setClosesAt(event.target.value)} className="app-input mt-1" />
            </label>
            <label className="block text-sm font-semibold md:col-span-3">
              Description
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="app-input mt-1 min-h-20" maxLength={800} />
            </label>
            <button type="submit" disabled={isSaving} className="app-button-primary md:col-span-3">
              Create draft
            </button>
          </form>
        ) : null}
      </div>

      {!activeRound ? (
        <EmptyState
          title="No voting round yet"
          description={
            club.memberRole === "OWNER"
              ? "Create a voting round when the club is ready to choose."
              : "The club owner has not opened voting yet."
          }
        />
      ) : (
        <div className="app-surface min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={activeRound.status === "OPEN" ? "teal" : "gold"}>
                  {activeRound.status}
                </StatusBadge>
                {activeRound.winner ? <StatusBadge tone="gold">Winner selected</StatusBadge> : null}
              </div>
              <h2 className="mt-3 break-words font-serif text-2xl sm:text-3xl">
                {activeRound.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--app-text-secondary)]">
                {activeRound.description || "No description added."}
              </p>
              <p className="mt-3 text-sm text-[var(--app-text-muted)]">
                {activeRound.totalVotes} of {activeRound.totalEligibleMembers} members voted · closes {formatDate(activeRound.closesAt)}
              </p>
            </div>

            {activeRound.canManage ? (
              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                {activeRound.status === "DRAFT" ? (
                  <button type="button" disabled={isSaving} onClick={() => void runRoundAction(() => openBookVoteRound(club.id, activeRound.id), "Voting opened")} className="app-button-primary">
                    Open voting
                  </button>
                ) : null}
                {activeRound.status === "OPEN" ? (
                  <button type="button" disabled={isSaving} onClick={() => void runRoundAction(() => closeBookVoteRound(club.id, activeRound.id), "Voting closed")} className="app-button-primary">
                    Close voting
                  </button>
                ) : null}
                {activeRound.status === "DRAFT" || activeRound.status === "OPEN" ? (
                  <button type="button" disabled={isSaving} onClick={() => void runRoundAction(() => cancelBookVoteRound(club.id, activeRound.id), "Voting cancelled")} className="app-button-secondary">
                    Cancel
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {activeRound.status === "OPEN" ? (
            <form onSubmit={handleNominate} className="mt-5 rounded-xl border border-[var(--app-border-subtle)] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <SectionHeader title="Nominate a book" />
                  <p className="text-sm text-[var(--app-text-secondary)]">
                    {pendingBook ? pendingBook.title : "Choose from BookCircle and Google Books."}
                  </p>
                </div>
                <button type="button" onClick={() => setSearchOpen(true)} className="app-button-secondary w-full sm:w-auto">
                  <BookOpen className="h-4 w-4" />
                  Choose book
                </button>
              </div>
              {pendingBook ? (
                <label className="mt-4 block text-sm font-semibold">
                  Reason
                  <textarea value={reason} onChange={(event) => setReason(event.target.value)} className="app-input mt-1 min-h-20" maxLength={1000} />
                </label>
              ) : null}
              <button type="submit" disabled={!pendingBook || isSaving} className="app-button-primary mt-4 w-full sm:w-auto">
                Nominate this book
              </button>
            </form>
          ) : null}

          {activeRound.winner ? (
            <div className="mt-5 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-accent-teal-soft)] p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-[var(--app-accent-gold)]">
                <Crown className="h-4 w-4" />
                Winning nomination
              </p>
              <p className="mt-2 font-serif text-2xl">{activeRound.winner.book.title}</p>
              {activeRound.canManage ? (
                <p className="mt-2 text-sm text-[var(--app-text-secondary)]">
                  Plan next read from the Reading tab and choose this saved BookCircle book.
                </p>
              ) : null}
            </div>
          ) : null}

          {activeRound.tiedLeaderIds.length > 1 && activeRound.canManage ? (
            <div className="mt-5 rounded-xl border border-[var(--app-border-subtle)] p-4">
              <SectionHeader title="Resolve tie" />
              <div className="mt-3 flex flex-wrap gap-2">
                {activeRound.nominations
                  .filter((nomination) => activeRound.tiedLeaderIds.includes(nomination.id))
                  .map((nomination) => (
                    <button key={nomination.id} type="button" onClick={() => void runRoundAction(() => resolveBookVoteWinner(club.id, activeRound.id, { nominationId: nomination.id }), "Winner selected")} className="app-button-secondary">
                      {nomination.book.title}
                    </button>
                  ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeRound.nominations.map((nomination) => (
              <article key={nomination.id} className="app-choice-row min-w-0 overflow-hidden rounded-xl p-4">
                <div className="grid min-w-0 grid-cols-[76px_minmax(0,1fr)] gap-3">
                  <div className="aspect-[2/3] overflow-hidden rounded-lg bg-[var(--app-surface-subtle)]">
                    {nomination.book.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={nomination.book.coverImage} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-8 w-8 text-[var(--app-accent-gold)]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 break-words font-serif text-xl leading-tight">
                      {nomination.book.title}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs text-[var(--app-text-muted)]">
                      {getAuthorsLabel(nomination.book.authors)}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--app-accent-gold)]">
                      {nomination.voteCount} votes
                    </p>
                  </div>
                </div>
                {nomination.reason ? (
                  <p className="mt-3 line-clamp-3 break-words text-sm leading-6 text-[var(--app-text-secondary)]">
                    {nomination.reason}
                  </p>
                ) : null}
                <p className="mt-3 text-xs text-[var(--app-text-muted)]">
                  Nominated by {nomination.nominatedBy.displayName}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {activeRound.canVote ? (
                    <button type="button" disabled={isSaving} onClick={() => void runRoundAction(() => voteForBook(club.id, activeRound.id, { nominationId: nomination.id }), nomination.isCurrentUserVote ? "Vote confirmed" : "Vote saved")} className={nomination.isCurrentUserVote ? "app-button-primary" : "app-button-secondary"} aria-pressed={nomination.isCurrentUserVote}>
                      {nomination.isCurrentUserVote ? <CheckCircle2 className="h-4 w-4" /> : <Vote className="h-4 w-4" />}
                      {nomination.isCurrentUserVote ? "Your vote" : activeRound.currentUserVoteNominationId ? "Change vote" : "Vote"}
                    </button>
                  ) : null}
                  {nomination.canRemove ? (
                    <button type="button" disabled={isSaving} onClick={() => void runRoundAction(() => removeBookNomination(club.id, activeRound.id, nomination.id), "Nomination removed")} className="app-button-secondary">
                      Remove nomination
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          {activeRound.nominations.length === 0 ? (
            <EmptyState title="No nominations yet" description="Nominate a book to begin voting." />
          ) : null}
        </div>
      )}

      <BookSearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Nominate a Book"
        subtitle="Search BookCircle and Google Books"
        onSelected={(book) => {
          setPendingBook(book);
          setSearchOpen(false);
        }}
      />
    </section>
  );
}
