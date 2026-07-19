"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, X } from "lucide-react";

import { BookSearchModal } from "@/components/books/BookSearchModal";
import type {
  BookDiscoveryResult,
  CreateReadingCyclePayload,
  ReadingCycle,
} from "@/lib/types";

type ReadingCycleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateReadingCyclePayload) => Promise<ReadingCycle>;
};

type FormErrors = {
  startDate?: string;
  targetEndDate?: string;
  goalDescription?: string;
  submit?: string;
};

const MAX_GOAL_LENGTH = 600;

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toIsoDateTime(dateValue: string): string {
  return new Date(`${dateValue}T00:00:00.000Z`).toISOString();
}

function getAuthorsLabel(authors: string[]): string {
  return authors.length > 0 ? authors.join(", ") : "Unknown author";
}

function getInitialTargetEndDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return toDateInputValue(date);
}

export function ReadingCycleDialog({
  open,
  onOpenChange,
  onSubmit,
}: ReadingCycleDialogProps) {
  const [selectedBook, setSelectedBook] = useState<BookDiscoveryResult | null>(
    null,
  );
  const [status, setStatus] = useState<"PLANNED" | "ACTIVE">("PLANNED");
  const [startDate, setStartDate] = useState(toDateInputValue(new Date()));
  const [targetEndDate, setTargetEndDate] = useState(getInitialTargetEndDate);
  const [goalDescription, setGoalDescription] = useState(
    "Read the complete book together and keep the conversation moving each week.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const bookSelection = useMemo(() => {
    if (!selectedBook) return null;

    if (selectedBook.source === "BOOKCIRCLE" && selectedBook.bookId) {
      return {
        source: "BOOKCIRCLE" as const,
        bookId: selectedBook.bookId,
      };
    }

    if (selectedBook.source === "GOOGLE_BOOKS" && selectedBook.googleBooksId) {
      return {
        source: "GOOGLE_BOOKS" as const,
        googleBooksId: selectedBook.googleBooksId,
      };
    }

    return null;
  }, [selectedBook]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange, open]);

  useEffect(() => {
    if (open) {
      setSelectedBook(null);
      setStatus("PLANNED");
      setStartDate(toDateInputValue(new Date()));
      setTargetEndDate(getInitialTargetEndDate());
      setGoalDescription(
        "Read the complete book together and keep the conversation moving each week.",
      );
      setErrors({});
    }
  }, [open]);

  function validateForm(): FormErrors {
    const nextErrors: FormErrors = {};

    if (!startDate) {
      nextErrors.startDate = "Start date is required.";
    }

    if (!targetEndDate) {
      nextErrors.targetEndDate = "Target end date is required.";
    }

    if (startDate && targetEndDate && targetEndDate <= startDate) {
      nextErrors.targetEndDate = "Target end date must be after start date.";
    }

    if (goalDescription.length > MAX_GOAL_LENGTH) {
      nextErrors.goalDescription = `Goal must be ${MAX_GOAL_LENGTH} characters or fewer.`;
    }

    if (!bookSelection) {
      nextErrors.submit = "Choose a book before creating the reading cycle.";
    }

    return nextErrors;
  }

  async function handleSubmit() {
    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !bookSelection) {
      return;
    }

    try {
      setIsSubmitting(true);
      const readingCycle = await onSubmit({
        bookSelection,
        status,
        startDate: toIsoDateTime(startDate),
        targetEndDate: toIsoDateTime(targetEndDate),
        goalDescription: goalDescription.trim() || undefined,
      });

      if (readingCycle) {
        onOpenChange(false);
      }
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Unable to create reading cycle. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) return null;

  if (!selectedBook) {
    return (
      <BookSearchModal
        open={open}
        onOpenChange={onOpenChange}
        onSelected={setSelectedBook}
        title="Choose the Next Read"
        subtitle="Pick a saved BookCircle book or discover one through Google Books."
      />
    );
  }

  return (
    <div className="app-modal-backdrop">
      <section
        aria-modal="true"
        role="dialog"
        aria-labelledby="reading-cycle-dialog-title"
        className="app-modal-panel max-w-3xl"
      >
        <header className="app-modal-header flex min-w-0 items-start justify-between gap-4 p-4 sm:p-5">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => setSelectedBook(null)}
              className="mb-3 inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-[var(--app-accent-gold)] hover:text-[var(--app-accent-gold-hover)]"
            >
              <ChevronLeft className="h-4 w-4" />
              Choose a different book
            </button>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--app-accent-gold)] sm:tracking-[0.2em]">
              Reading Cycle
            </p>
            <h2
              id="reading-cycle-dialog-title"
              className="mt-1 break-words font-serif text-2xl text-[var(--app-text-primary)] sm:text-3xl"
            >
              Set the Schedule
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="shrink-0 rounded-lg border border-[var(--app-border-subtle)] p-2 text-[var(--app-text-secondary)] transition hover:border-[var(--app-border-strong)] hover:text-[var(--app-text-primary)]"
            aria-label="Close reading cycle dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid min-w-0 gap-6 p-4 lg:grid-cols-[170px_minmax(0,1fr)] lg:p-5">
          <div>
            <div className="mx-auto aspect-[2/3] w-full max-w-[170px] overflow-hidden rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-subtle)] lg:max-w-none">
              {selectedBook.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedBook.coverImage}
                  alt=""
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <CalendarDays className="h-10 w-10 text-[var(--app-accent-gold)]" />
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 space-y-5">
            <div>
              <h3 className="break-words font-serif text-2xl leading-tight text-[var(--app-text-primary)] sm:text-3xl">
                {selectedBook.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
                {getAuthorsLabel(selectedBook.authors)}
              </p>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-[var(--app-text-secondary)]">
                Cycle status
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["PLANNED", "ACTIVE"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStatus(option)}
                    className={`min-w-0 rounded-xl border p-4 text-left transition ${
                      status === option
                        ? "border-[var(--app-accent-gold)] bg-[var(--app-accent-teal-soft)]"
                        : "border-[var(--app-border-subtle)] bg-[rgba(244,234,216,0.045)] hover:border-[var(--app-border-strong)]"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-[var(--app-text-primary)]">
                      {option === "ACTIVE" ? "Start now" : "Plan for later"}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--app-text-muted)]">
                      {option === "ACTIVE"
                        ? "Make this the club's current read."
                        : "Save it as the club's upcoming read."}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="app-field-label">
                  Start date
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="app-input mt-2 w-full px-3 py-3 text-sm"
                />
                {errors.startDate ? (
                  <p className="mt-1 text-xs text-[#D35454]">
                    {errors.startDate}
                  </p>
                ) : null}
              </label>

              <label className="block">
                <span className="app-field-label">
                  Target end date
                </span>
                <input
                  type="date"
                  value={targetEndDate}
                  onChange={(event) => setTargetEndDate(event.target.value)}
                  className="app-input mt-2 w-full px-3 py-3 text-sm"
                />
                {errors.targetEndDate ? (
                  <p className="mt-1 text-xs text-[#D35454]">
                    {errors.targetEndDate}
                  </p>
                ) : null}
              </label>
            </div>

            <label className="block">
              <span className="app-field-label">
                Reading goal
              </span>
              <textarea
                value={goalDescription}
                onChange={(event) => setGoalDescription(event.target.value)}
                rows={4}
                className="app-input mt-2 w-full px-3 py-3 text-sm leading-6"
              />
              {errors.goalDescription ? (
                <p className="mt-1 text-xs text-[#D35454]">
                  {errors.goalDescription}
                </p>
              ) : null}
            </label>

            <div className="app-choice-row rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--app-accent-gold)]">
                Confirmation
              </p>
              <p className="mt-2 text-sm text-[var(--app-text-secondary)]">
                {status === "ACTIVE"
                  ? "This will become the club's current read."
                  : "This will become the club's upcoming read."}
              </p>
            </div>

            {errors.submit ? (
              <p className="rounded-lg border border-[rgba(196,95,95,0.45)] bg-[rgba(196,95,95,0.12)] p-3 text-sm text-[var(--app-text-primary)]">
                {errors.submit}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="app-button-secondary w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleSubmit()}
                className="app-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting ? "Saving..." : "Start reading cycle"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
