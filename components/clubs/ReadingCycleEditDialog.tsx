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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050302]/75 p-4 backdrop-blur-sm">
      <section
        aria-modal="true"
        role="dialog"
        aria-labelledby="reading-cycle-edit-title"
        className="w-full max-w-xl rounded-2xl border border-[#C9A96E]/30 bg-[#100904] shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#C9A96E]/20 bg-[#2A1810]/90 p-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
              Reading Cycle
            </p>
            <h2
              id="reading-cycle-edit-title"
              className="mt-1 font-serif text-3xl text-[#F2E8D9]"
            >
              Edit Schedule
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-[#C9A96E]/20 p-2 text-[#F2E8D9]/70 transition hover:border-[#C9A96E]/50 hover:text-[#F2E8D9]"
            aria-label="Close edit dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-5 p-5">
          <div>
            <h3 className="font-serif text-2xl text-[#F2E8D9]">
              {activeCycle.book.title}
            </h3>
            <p className="mt-1 text-sm text-[#F2E8D9]/60">
              Update the dates or shared goal for this reading cycle.
            </p>
          </div>

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
          </label>

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
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
