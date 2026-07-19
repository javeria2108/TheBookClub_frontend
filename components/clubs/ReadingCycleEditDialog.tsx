"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type { ReadingCycle, UpdateReadingCyclePayload } from "@/lib/types";

type ReadingCycleEditDialogProps = {
  cycle: ReadingCycle | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    cycle: ReadingCycle,
    payload: UpdateReadingCyclePayload,
  ) => Promise<ReadingCycle>;
};

type FormErrors = {
  startDate?: string;
  targetEndDate?: string;
  submit?: string;
};

function toDateInputValue(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}

function toIsoDateTime(dateValue: string): string {
  return new Date(`${dateValue}T00:00:00.000Z`).toISOString();
}

export function ReadingCycleEditDialog({
  cycle,
  onOpenChange,
  onSubmit,
}: ReadingCycleEditDialogProps) {
  const [startDate, setStartDate] = useState("");
  const [targetEndDate, setTargetEndDate] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!cycle) return;
    setStartDate(toDateInputValue(cycle.startDate));
    setTargetEndDate(toDateInputValue(cycle.targetEndDate));
    setGoalDescription(cycle.goalDescription ?? "");
    setErrors({});
  }, [cycle]);

  if (!cycle) return null;

  const activeCycle = cycle;

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

    return nextErrors;
  }

  async function handleSubmit() {
    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(activeCycle, {
        startDate: toIsoDateTime(startDate),
        targetEndDate: toIsoDateTime(targetEndDate),
        goalDescription: goalDescription.trim() || null,
      });
      onOpenChange(false);
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Unable to update reading cycle.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="app-modal-backdrop">
      <section
        aria-modal="true"
        role="dialog"
        aria-labelledby="reading-cycle-edit-title"
        className="app-modal-panel max-w-xl"
      >
        <header className="app-modal-header flex min-w-0 items-start justify-between gap-4 p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--app-accent-gold)] sm:tracking-[0.2em]">
              Reading Cycle
            </p>
            <h2
              id="reading-cycle-edit-title"
              className="mt-1 break-words font-serif text-2xl text-[var(--app-text-primary)] sm:text-3xl"
            >
              Edit Schedule
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="shrink-0 rounded-lg border border-[var(--app-border-subtle)] p-2 text-[var(--app-text-secondary)] transition hover:border-[var(--app-border-strong)] hover:text-[var(--app-text-primary)]"
            aria-label="Close edit dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-5 p-4 sm:p-5">
          <div>
            <h3 className="break-words font-serif text-2xl text-[var(--app-text-primary)]">
              {activeCycle.book.title}
            </h3>
            <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
              Update the dates or shared goal for this reading cycle.
            </p>
          </div>

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
          </label>

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
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
