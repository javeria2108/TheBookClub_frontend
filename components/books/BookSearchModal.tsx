"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Search, X } from "lucide-react";

import { toast } from "@/components/ui/use-toast";
import { importGoogleBook, searchGoogleBooks } from "@/lib/books";
import type { Book, BookDiscoveryResult } from "@/lib/types";

type BookSearchModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported?: (book: Book) => void | Promise<void>;
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
  return book.internalBookId ?? book.googleBooksId ?? book.title;
}

export function BookSearchModal({
  open,
  onOpenChange,
  onImported,
}: BookSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookDiscoveryResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
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

  const handleImport = async (googleBooksId: string) => {
    try {
      setImportingId(googleBooksId);
      const importedBook = await importGoogleBook(googleBooksId);
      await onImported?.(importedBook);
      toast({
        title: "Book imported",
        description: `${importedBook.title} is now saved in BookCircle.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Unable to import book",
        description:
          err instanceof Error
            ? err.message
            : "Please try importing this book again.",
      });
    } finally {
      setImportingId(null);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050302]/75 p-4 backdrop-blur-sm">
      <section
        aria-modal="true"
        role="dialog"
        aria-labelledby="book-search-title"
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#C9A96E]/30 bg-[#100904] shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
      >
        <header className="border-b border-[#C9A96E]/20 bg-[#2A1810]/90 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                Book Discovery
              </p>
              <h2
                id="book-search-title"
                className="mt-1 font-serif text-3xl text-[#F2E8D9]"
              >
                Search Google Books
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full border border-[#C9A96E]/20 p-2 text-[#F2E8D9]/70 transition hover:border-[#C9A96E]/50 hover:text-[#F2E8D9]"
              aria-label="Close book search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="relative mt-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A96E]/70" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, author, or ISBN..."
              className="w-full rounded-lg border border-[#C9A96E]/30 bg-[#1A0F07] py-3 pl-10 pr-3 text-sm text-[#F2E8D9] placeholder:text-[#F2E8D9]/40 focus:border-[#C9A96E] focus:outline-none"
              autoFocus
            />
          </div>
        </header>

        <div className="min-h-80 overflow-y-auto p-5">
          {!trimmedQuery ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-[#C9A96E]/25 bg-[#2A1810]/50 p-8 text-center">
              <BookOpen className="mb-4 h-9 w-9 text-[#C9A96E]" />
              <p className="font-serif text-2xl text-[#F2E8D9]">
                Find a book to save
              </p>
              <p className="mt-2 max-w-md text-sm text-[#F2E8D9]/65">
                Search Google Books, then import the metadata into BookCircle.
              </p>
            </div>
          ) : trimmedQuery.length < MIN_SEARCH_LENGTH ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-[#C9A96E]/25 bg-[#2A1810]/50 p-8 text-center">
              <Search className="mb-4 h-9 w-9 text-[#C9A96E]" />
              <p className="font-serif text-2xl text-[#F2E8D9]">
                Keep typing
              </p>
              <p className="mt-2 max-w-md text-sm text-[#F2E8D9]/65">
                Enter at least {MIN_SEARCH_LENGTH} characters so the search can
                return useful book matches.
              </p>
            </div>
          ) : isSearching ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse rounded-xl border border-[#C9A96E]/15 bg-[#2A1810]"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-[#8B4A3C]/60 bg-[#8B4A3C]/15 p-5 text-center">
              <p className="font-serif text-2xl text-[#F2E8D9]">
                Search failed
              </p>
              <p className="mt-2 text-sm text-[#F2E8D9]/70">{error}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#C9A96E]/25 bg-[#2A1810]/50 p-8 text-center">
              <p className="font-serif text-2xl text-[#F2E8D9]">
                Book not found
              </p>
              <p className="mt-2 text-sm text-[#F2E8D9]/65">
                Book with title &quot;{trimmedQuery}&quot; was not found. Try a
                more specific title, author, or ISBN.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((book) => {
                const canImport = !book.isImported && Boolean(book.googleBooksId);
                const isImporting = importingId === book.googleBooksId;

                return (
                  <article
                    key={getResultKey(book)}
                    className="grid gap-4 rounded-xl border border-[#C9A96E]/18 bg-[#2A1810]/80 p-4 sm:grid-cols-[88px_1fr]"
                  >
                    <div className="h-32 w-[88px] overflow-hidden rounded-lg border border-[#C9A96E]/20 bg-[#1A0F07]">
                      {book.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.coverImage}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <BookOpen className="h-8 w-8 text-[#C9A96E]/60" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-serif text-2xl leading-tight text-[#F2E8D9]">
                            {book.title}
                          </h3>
                          <p className="mt-1 text-sm text-[#F2E8D9]/65">
                            {getAuthorsLabel(book.authors)}
                            {book.publishedYear
                              ? ` - ${book.publishedYear}`
                              : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={!canImport || isImporting}
                          onClick={() => {
                            if (book.googleBooksId) {
                              void handleImport(book.googleBooksId);
                            }
                          }}
                          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#C9A96E] px-4 py-2 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {book.isImported
                            ? "Saved"
                            : isImporting
                              ? "Importing..."
                              : "Import Book"}
                        </button>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-[#F2E8D9]/70">
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
