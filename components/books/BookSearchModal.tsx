"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Search, X } from "lucide-react";

import { searchGoogleBooks } from "@/lib/books";
import type { BookDiscoveryResult } from "@/lib/types";

type BookSearchModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelected?: (book: BookDiscoveryResult) => void | Promise<void>;
  title?: string;
  subtitle?: string;
};

const SEARCH_DEBOUNCE_MS = 450;
const MIN_SEARCH_LENGTH = 4;

function getAuthorsLabel(authors: string[]): string {
  return authors.length > 0 ? authors.join(", ") : "Unknown author";
}

function getDescription(description: string | null): string {
  if (!description) {
    return "No description available from Google Books.";
  }

  return description.length > 180
    ? `${description.slice(0, 177).trim()}...`
    : description;
}

function getResultKey(book: BookDiscoveryResult): string {
  return book.bookId ?? book.googleBooksId ?? book.title;
}

export function BookSearchModal({
  open,
  onOpenChange,
  onSelected,
  title = "Choose a Book",
  subtitle = "Search BookCircle and Google Books",
}: BookSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookDiscoveryResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectingKey, setSelectingKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!trimmedQuery || trimmedQuery.length < MIN_SEARCH_LENGTH) {
      setResults([]);
      setError("");
      setIsSearching(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      async function runSearch() {
        try {
          setIsSearching(true);
          setError("");
          const nextResults = await searchGoogleBooks(trimmedQuery);
          setResults(nextResults);
        } catch (err) {
          setResults([]);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to search books. Please try again.",
          );
        } finally {
          setIsSearching(false);
        }
      }

      void runSearch();
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [open, trimmedQuery]);

  const handleSelect = async (book: BookDiscoveryResult) => {
    const resultKey = getResultKey(book);

    try {
      setSelectingKey(resultKey);
      await onSelected?.(book);
    } finally {
      setSelectingKey(null);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="app-modal-backdrop">
      <section
        aria-modal="true"
        role="dialog"
        aria-labelledby="book-search-title"
        className="app-modal-panel flex max-w-3xl flex-col overflow-hidden"
      >
        <header className="app-modal-header p-4 sm:p-5">
          <div className="flex min-w-0 items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--app-accent-gold)] sm:tracking-[0.2em]">
                Book Discovery
              </p>
              <h2
                id="book-search-title"
                className="mt-1 break-words font-serif text-2xl text-[var(--app-text-primary)] sm:text-3xl"
              >
                {title}
              </h2>
              <p className="mt-2 text-sm text-[var(--app-text-secondary)]">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="shrink-0 rounded-lg border border-[var(--app-border-subtle)] p-2 text-[var(--app-text-secondary)] transition hover:border-[var(--app-border-strong)] hover:text-[var(--app-text-primary)]"
              aria-label="Close book search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="relative mt-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-accent-gold)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, author, or ISBN..."
              className="app-input w-full py-3 pl-10 pr-3 text-sm"
              autoFocus
            />
          </div>
        </header>

        <div className="min-h-80 overflow-y-auto p-4 sm:p-5">
          {!trimmedQuery ? (
            <div className="app-surface flex min-h-72 flex-col items-center justify-center rounded-xl border-dashed p-8 text-center">
              <BookOpen className="mb-4 h-9 w-9 text-[var(--app-accent-gold)]" />
              <p className="font-serif text-2xl text-[var(--app-text-primary)]">
                Find a book to save
              </p>
              <p className="mt-2 max-w-md text-sm text-[var(--app-text-secondary)]">
                Search saved BookCircle books and Google Books, then choose one
                for this club.
              </p>
            </div>
          ) : trimmedQuery.length < MIN_SEARCH_LENGTH ? (
            <div className="app-surface flex min-h-72 flex-col items-center justify-center rounded-xl border-dashed p-8 text-center">
              <Search className="mb-4 h-9 w-9 text-[var(--app-accent-gold)]" />
              <p className="font-serif text-2xl text-[var(--app-text-primary)]">
                Keep typing
              </p>
              <p className="mt-2 max-w-md text-sm text-[var(--app-text-secondary)]">
                Enter at least {MIN_SEARCH_LENGTH} characters so the search can
                return useful book matches.
              </p>
            </div>
          ) : isSearching ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)]"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-[#8B4A3C]/60 bg-[#8B4A3C]/15 p-5 text-center">
              <p className="font-serif text-2xl text-[var(--app-text-primary)]">
                Search failed
              </p>
              <p className="mt-2 text-sm text-[var(--app-text-secondary)]">{error}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="app-surface rounded-xl border-dashed p-8 text-center">
              <p className="font-serif text-2xl text-[var(--app-text-primary)]">
                Book not found
              </p>
              <p className="mt-2 text-sm text-[var(--app-text-secondary)]">
                Book with title &quot;{trimmedQuery}&quot; was not found. Try a
                more specific title, author, or ISBN.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((book) => {
                const resultKey = getResultKey(book);
                const isSelecting = selectingKey === resultKey;

                return (
                  <article
                    key={getResultKey(book)}
                    className="app-surface grid min-w-0 gap-4 rounded-xl p-4 md:grid-cols-[88px_minmax(0,1fr)]"
                  >
                    <div className="mx-auto h-32 w-[88px] overflow-hidden rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-subtle)] md:mx-0">
                      {book.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.coverImage}
                          alt=""
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <BookOpen className="h-8 w-8 text-[var(--app-accent-gold)]" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="break-words font-serif text-2xl leading-tight text-[var(--app-text-primary)]">
                            {book.title}
                          </h3>
                          <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
                            {getAuthorsLabel(book.authors)}
                            {book.publishedYear
                              ? ` - ${book.publishedYear}`
                              : ""}
                          </p>
                          {book.isSaved ? (
                            <p className="mt-2 inline-flex rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-accent-teal-soft)] px-3 py-1 text-xs text-[var(--app-accent-gold)]">
                              Saved in BookCircle
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          disabled={isSelecting}
                          onClick={() => void handleSelect(book)}
                          className="app-button-primary w-full shrink-0 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                          {isSelecting ? "Choosing..." : "Choose this book"}
                        </button>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-[var(--app-text-secondary)]">
                        {getDescription(book.description)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
