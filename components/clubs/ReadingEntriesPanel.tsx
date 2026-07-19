"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { BookMarked, MessageSquarePlus, Quote } from "lucide-react";

import { EmptyState, ErrorState, SectionHeader, StatusBadge } from "@/components/ui/app-primitives";
import { useToast } from "@/components/ui/use-toast";
import {
  createReadingEntry,
  deleteReadingEntry,
  getReadingEntries,
  type ReadingEntryFilter,
} from "@/lib/reading-entries";
import type { ReadingCycle, ReadingEntry, ReadingEntryType, ReadingTarget } from "@/lib/types";

type ReadingEntriesPanelProps = {
  clubId: string;
  cycle: ReadingCycle;
  targets: ReadingTarget[];
};

const FILTERS: Array<{ label: string; value: ReadingEntryFilter }> = [
  { label: "All", value: "ALL" },
  { label: "Reflections", value: "REFLECTION" },
  { label: "Favourite Quotes", value: "QUOTE" },
  { label: "Mine", value: "MINE" },
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function referenceLabel(entry: ReadingEntry): string {
  const pieces = [
    entry.chapterReference,
    entry.pageNumber ? `Page ${entry.pageNumber}` : null,
    entry.readingTarget?.rangeLabel ?? null,
  ].filter(Boolean);
  return pieces.join(" · ");
}

export function ReadingEntriesPanel({
  clubId,
  cycle,
  targets,
}: ReadingEntriesPanelProps) {
  const { toast } = useToast();
  const [filter, setFilter] = useState<ReadingEntryFilter>("ALL");
  const [entries, setEntries] = useState<ReadingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formType, setFormType] = useState<ReadingEntryType | null>(null);
  const [body, setBody] = useState("");
  const [commentary, setCommentary] = useState("");
  const [readingTargetId, setReadingTargetId] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [chapterReference, setChapterReference] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const canCreate = cycle.status === "ACTIVE" || cycle.status === "COMPLETED";

  const loadEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const page = await getReadingEntries(clubId, cycle.id, filter);
      setEntries(page.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entries");
    } finally {
      setIsLoading(false);
    }
  }, [clubId, cycle.id, filter]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const resetForm = () => {
    setFormType(null);
    setBody("");
    setCommentary("");
    setReadingTargetId("");
    setPageNumber("");
    setChapterReference("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formType) return;

    try {
      setIsSaving(true);
      const entry = await createReadingEntry(clubId, cycle.id, {
        entryType: formType,
        body,
        commentary: formType === "QUOTE" ? commentary || null : null,
        readingTargetId: readingTargetId || null,
        pageNumber: pageNumber ? Number(pageNumber) : null,
        chapterReference: chapterReference || null,
      });
      setEntries((current) => [entry, ...current]);
      resetForm();
      toast({ title: formType === "QUOTE" ? "Quote shared" : "Reflection shared" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Unable to share",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (entry: ReadingEntry) => {
    await deleteReadingEntry(clubId, entry.id);
    setEntries((current) => current.filter((item) => item.id !== entry.id));
  };

  return (
    <section className="app-surface min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <SectionHeader title="Reflections & Quotes" />
          <p className="text-sm leading-6 text-[var(--app-text-secondary)]">
            Preserve the ideas and brief lines that stayed with this reading circle.
          </p>
        </div>
        {canCreate ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => setFormType("REFLECTION")} className="app-button-secondary">
              <MessageSquarePlus className="h-4 w-4" />
              Share reflection
            </button>
            <button type="button" onClick={() => setFormType("QUOTE")} className="app-button-primary">
              <Quote className="h-4 w-4" />
              Share quote
            </button>
          </div>
        ) : (
          <StatusBadge tone="gold">Read-only until the cycle starts</StatusBadge>
        )}
      </div>

      <div className="mt-4 flex max-w-full gap-2 overflow-x-auto pb-1">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`min-h-10 shrink-0 rounded-full border px-3 text-xs font-semibold ${
              filter === item.value
                ? "border-[var(--app-accent-gold)] bg-[var(--app-accent-teal-soft)] text-[var(--app-accent-gold-hover)]"
                : "border-[var(--app-border-subtle)] text-[var(--app-text-secondary)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {formType ? (
        <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-[var(--app-border-subtle)] p-4">
          <div className="grid gap-3 lg:grid-cols-3">
            <label className="block text-sm font-semibold lg:col-span-3">
              {formType === "QUOTE" ? "Favourite quote" : "Reflection"}
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className="app-input mt-1 min-h-28"
                maxLength={formType === "QUOTE" ? 300 : 2000}
                required
              />
            </label>
            {formType === "QUOTE" ? (
              <p className="text-xs text-[var(--app-text-muted)] lg:col-span-3">
                {body.length}/300 characters. Quotes should be brief excerpts, not full passages.
              </p>
            ) : null}
            {formType === "QUOTE" ? (
              <label className="block text-sm font-semibold lg:col-span-3">
                Optional thought
                <textarea
                  value={commentary}
                  onChange={(event) => setCommentary(event.target.value)}
                  className="app-input mt-1 min-h-20"
                  maxLength={1000}
                />
              </label>
            ) : null}
            <label className="block text-sm font-semibold">
              Reading target
              <select value={readingTargetId} onChange={(event) => setReadingTargetId(event.target.value)} className="app-input mt-1">
                <option value="">No target</option>
                {targets.map((target) => (
                  <option key={target.id} value={target.id}>
                    {target.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Page
              <input value={pageNumber} onChange={(event) => setPageNumber(event.target.value)} type="number" min={1} className="app-input mt-1" />
            </label>
            <label className="block text-sm font-semibold">
              Chapter
              <input value={chapterReference} onChange={(event) => setChapterReference(event.target.value)} className="app-input mt-1" maxLength={80} />
            </label>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button type="submit" disabled={isSaving} className="app-button-primary">
              {formType === "QUOTE" ? "Share quote" : "Share reflection"}
            </button>
            <button type="button" onClick={resetForm} className="app-button-secondary">
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {isLoading ? (
        <div className="mt-5 h-32 animate-pulse rounded-xl bg-[var(--app-surface-subtle)]" />
      ) : error ? (
        <ErrorState
          title="Unable to load entries"
          description={error}
          action={<button type="button" onClick={() => void loadEntries()} className="app-button-secondary">Retry</button>}
        />
      ) : entries.length === 0 ? (
        <EmptyState title="No entries yet" description="Share a reflection or a brief favourite quote." />
      ) : (
        <div className="mt-5 grid min-w-0 gap-4 lg:grid-cols-2">
          {entries.map((entry) => (
            <article key={entry.id} className="app-choice-row min-w-0 overflow-hidden rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusBadge tone={entry.entryType === "QUOTE" ? "gold" : "teal"}>
                  {entry.entryType === "QUOTE" ? "Favourite Quote" : "Reflection"}
                </StatusBadge>
                <p className="text-xs text-[var(--app-text-muted)]">
                  {formatDate(entry.createdAt)}
                </p>
              </div>
              {entry.entryType === "QUOTE" ? (
                <blockquote className="mt-4 break-words border-l-2 border-[var(--app-accent-gold)] pl-4 font-serif text-xl leading-relaxed text-[var(--app-text-primary)]">
                  {entry.body}
                </blockquote>
              ) : (
                <p className="mt-4 whitespace-pre-line break-words text-sm leading-6 text-[var(--app-text-secondary)]">
                  {entry.body}
                </p>
              )}
              {entry.commentary ? (
                <p className="mt-3 whitespace-pre-line break-words text-sm leading-6 text-[var(--app-text-secondary)]">
                  {entry.commentary}
                </p>
              ) : null}
              {referenceLabel(entry) ? (
                <p className="mt-3 text-xs text-[var(--app-accent-gold)]">
                  {referenceLabel(entry)}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--app-text-muted)]">
                <span className="inline-flex items-center gap-2">
                  <BookMarked className="h-4 w-4 text-[var(--app-accent-gold)]" />
                  Shared by {entry.author.displayName}
                </span>
                {entry.canDelete ? (
                  <button type="button" onClick={() => void handleDelete(entry)} className="font-semibold text-[var(--app-text-secondary)]">
                    Remove
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
