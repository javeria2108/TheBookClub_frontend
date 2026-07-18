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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050302]/75 p-4 backdrop-blur-sm">
      <section
        aria-modal="true"
        role="dialog"
        aria-labelledby="reading-cycle-dialog-title"
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#C9A96E]/30 bg-[#100904] shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#C9A96E]/20 bg-[#2A1810]/90 p-5">
          <div>
            <button
              type="button"
              onClick={() => setSelectedBook(null)}
              className="mb-3 inline-flex items-center gap-2 text-sm text-[#C9A96E] hover:text-[#d8b884]"
            >
              <ChevronLeft className="h-4 w-4" />
              Choose a different book
            </button>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
              Reading Cycle
            </p>
            <h2
              id="reading-cycle-dialog-title"
              className="mt-1 font-serif text-3xl text-[#F2E8D9]"
            >
              Set the Schedule
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-[#C9A96E]/20 p-2 text-[#F2E8D9]/70 transition hover:border-[#C9A96E]/50 hover:text-[#F2E8D9]"
            aria-label="Close reading cycle dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid gap-6 p-5 md:grid-cols-[170px_1fr]">
          <div>
            <div className="aspect-[2/3] overflow-hidden rounded-xl border border-[#C9A96E]/25 bg-[#1A0F07]">
              {selectedBook.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedBook.coverImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <CalendarDays className="h-10 w-10 text-[#C9A96E]/70" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="font-serif text-3xl leading-tight text-[#F2E8D9]">
                {selectedBook.title}
              </h3>
              <p className="mt-1 text-sm text-[#F2E8D9]/65">
                {getAuthorsLabel(selectedBook.authors)}
              </p>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-[#F2E8D9]">
                Cycle status
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["PLANNED", "ACTIVE"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStatus(option)}
                    className={`rounded-xl border p-4 text-left transition ${
                      status === option
                        ? "border-[#C9A96E] bg-[#C9A96E]/15"
                        : "border-[#C9A96E]/20 bg-[#1A0F07]/70 hover:border-[#C9A96E]/50"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-[#F2E8D9]">
                      {option === "ACTIVE" ? "Start now" : "Plan for later"}
                    </span>
                    <span className="mt-1 block text-xs text-[#F2E8D9]/60">
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
                <span className="text-sm font-medium text-[#F2E8D9]">
                  Start date
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[#C9A96E]/30 bg-[#1A0F07] px-3 py-3 text-sm text-[#F2E8D9] focus:border-[#C9A96E] focus:outline-none"
                />
                {errors.startDate ? (
                  <p className="mt-1 text-xs text-[#D35454]">
                    {errors.startDate}
                  </p>
                ) : null}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#F2E8D9]">
                  Target end date
                </span>
                <input
                  type="date"
                  value={targetEndDate}
                  onChange={(event) => setTargetEndDate(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[#C9A96E]/30 bg-[#1A0F07] px-3 py-3 text-sm text-[#F2E8D9] focus:border-[#C9A96E] focus:outline-none"
                />
                {errors.targetEndDate ? (
                  <p className="mt-1 text-xs text-[#D35454]">
                    {errors.targetEndDate}
                  </p>
                ) : null}
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[#F2E8D9]">
                Reading goal
              </span>
              <textarea
                value={goalDescription}
                onChange={(event) => setGoalDescription(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-lg border border-[#C9A96E]/30 bg-[#1A0F07] px-3 py-3 text-sm leading-6 text-[#F2E8D9] focus:border-[#C9A96E] focus:outline-none"
              />
              {errors.goalDescription ? (
                <p className="mt-1 text-xs text-[#D35454]">
                  {errors.goalDescription}
                </p>
              ) : null}
            </label>

            <div className="rounded-xl border border-[#C9A96E]/20 bg-[#1A0F07]/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#C9A96E]">
                Confirmation
              </p>
              <p className="mt-2 text-sm text-[#F2E8D9]/75">
                {status === "ACTIVE"
                  ? "This will become the club's current read."
                  : "This will become the club's upcoming read."}
              </p>
            </div>

            {errors.submit ? (
              <p className="rounded-lg border border-[#D35454]/45 bg-[#D35454]/10 p-3 text-sm text-[#F2E8D9]">
                {errors.submit}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg border border-[#C9A96E]/30 px-4 py-3 text-sm text-[#F2E8D9] transition hover:border-[#C9A96E]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleSubmit()}
                className="rounded-lg bg-[#C9A96E] px-4 py-3 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884] disabled:cursor-not-allowed disabled:opacity-60"
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
