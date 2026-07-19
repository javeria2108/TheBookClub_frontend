"use client";

import { BookOpen, CalendarDays, CheckCircle2, Clock, XCircle } from "lucide-react";

import { ReadingProgressPanel } from "@/components/clubs/ReadingProgressPanel";
import type { ReadingCycle } from "@/lib/types";
import type { ReadingProgressResponse } from "@/lib/types";

type ReadingCycleSectionProps = {
  currentCycle: ReadingCycle | null;
  completedCycles: ReadingCycle[];
  isOwner: boolean;
  isMember: boolean;
  isLoading: boolean;
  onCreate: () => void;
  onEdit: (cycle: ReadingCycle) => void;
  onStart: (cycle: ReadingCycle) => void;
  onComplete: (cycle: ReadingCycle) => void;
  onCancel: (cycle: ReadingCycle) => void;
  actionInProgress: string | null;
  progress: ReadingProgressResponse | null;
  isProgressLoading: boolean;
  progressError: string;
  isProgressSaving: boolean;
  onRetryProgress: () => void;
  onUpdateProgress: (progressPercentage: number) => Promise<void>;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getAuthorsLabel(authors: string[]): string {
  return authors.length > 0 ? authors.join(", ") : "Unknown author";
}

function getDaysRemaining(targetEndDate: string): string {
  const today = new Date();
  const endDate = new Date(targetEndDate);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const days = Math.ceil(
    (endDate.getTime() - today.getTime()) / millisecondsPerDay,
  );

  if (days < 0) return "Target date passed";
  if (days === 0) return "Ends today";
  if (days === 1) return "1 day remaining";
  return `${days} days remaining`;
}

function getStatusLabel(status: ReadingCycle["status"]): string {
  if (status === "ACTIVE") return "Currently Reading";
  if (status === "PLANNED") return "Up Next";
  if (status === "COMPLETED") return "Completed";
  return "Cancelled";
}

export function ReadingCycleSection({
  currentCycle,
  completedCycles,
  isOwner,
  isMember,
  isLoading,
  onCreate,
  onEdit,
  onStart,
  onComplete,
  onCancel,
  actionInProgress,
  progress,
  isProgressLoading,
  progressError,
  isProgressSaving,
  onRetryProgress,
  onUpdateProgress,
}: ReadingCycleSectionProps) {
  const isCurrentPlanned = currentCycle?.status === "PLANNED";
  const isCurrentActive = currentCycle?.status === "ACTIVE";

  return (
    <section className="app-surface-elevated min-w-0 overflow-hidden rounded-2xl">
      <div className="app-modal-header p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--app-accent-gold)] sm:tracking-[0.2em]">
              Club Reading
            </p>
            <h2 className="mt-1 break-words font-serif text-2xl text-[var(--app-text-primary)] sm:text-3xl">
              Shared Reading Cycle
            </h2>
          </div>
          {isOwner ? (
            <button
              type="button"
              onClick={onCreate}
              className="app-button-primary w-full sm:w-auto"
            >
              {currentCycle ? "Plan next read" : "Choose the first book"}
            </button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="grid min-w-0 gap-6 p-4 sm:p-5 lg:grid-cols-[170px_minmax(0,1fr)] lg:p-6">
          <div className="mx-auto aspect-[2/3] w-full max-w-[170px] animate-pulse rounded-xl bg-[var(--app-surface)] lg:max-w-none" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-[var(--app-surface)]" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-[var(--app-surface)]" />
            <div className="h-24 animate-pulse rounded bg-[var(--app-surface)]" />
          </div>
        </div>
      ) : currentCycle ? (
        <div className="space-y-6 p-4 sm:p-5 lg:p-6">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
            <div className="mx-auto aspect-[2/3] w-full max-w-[170px] overflow-hidden rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-subtle)] lg:max-w-none">
              {currentCycle.book.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentCycle.book.coverImage}
                  alt=""
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <BookOpen className="h-12 w-12 text-[var(--app-accent-gold)]" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <span className="inline-flex rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-accent-teal-soft)] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[var(--app-accent-gold)]">
                {getStatusLabel(currentCycle.status)}
              </span>
              <h3 className="mt-4 break-words font-serif text-3xl leading-tight text-[var(--app-text-primary)] sm:text-4xl">
                {currentCycle.book.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--app-text-secondary)]">
                {getAuthorsLabel(currentCycle.book.authors)}
              </p>

              <div className="mt-5 grid min-w-0 gap-3 md:grid-cols-3">
                <div className="app-choice-row min-w-0 rounded-xl p-4">
                  <CalendarDays className="mb-2 h-4 w-4 text-[var(--app-accent-gold)]" />
                  <p className="break-words text-sm text-[var(--app-text-primary)]">
                    {formatDate(currentCycle.startDate)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--app-text-muted)]">Start date</p>
                </div>
                <div className="app-choice-row min-w-0 rounded-xl p-4">
                  <Clock className="mb-2 h-4 w-4 text-[var(--app-accent-gold)]" />
                  <p className="break-words text-sm text-[var(--app-text-primary)]">
                    {formatDate(currentCycle.targetEndDate)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--app-text-muted)]">Target end</p>
                </div>
                <div className="app-choice-row min-w-0 rounded-xl p-4">
                  <CheckCircle2 className="mb-2 h-4 w-4 text-[var(--app-accent-gold)]" />
                  <p className="break-words text-sm text-[var(--app-text-primary)]">
                    {currentCycle.status === "COMPLETED" &&
                    currentCycle.completedAt
                      ? formatDate(currentCycle.completedAt)
                      : getDaysRemaining(currentCycle.targetEndDate)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--app-text-muted)]">Timeline</p>
                </div>
              </div>

              {currentCycle.goalDescription ? (
                <p className="app-choice-row mt-5 rounded-xl p-4 text-sm leading-6 text-[var(--app-text-secondary)]">
                  {currentCycle.goalDescription}
                </p>
              ) : null}

              <div className="mt-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
                {currentCycle.book.previewUrl ? (
                  <a
                    href={currentCycle.book.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="app-button-secondary w-full sm:w-auto"
                  >
                    Preview
                  </a>
                ) : null}
                {currentCycle.book.infoUrl ? (
                  <a
                    href={currentCycle.book.infoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="app-button-secondary w-full sm:w-auto"
                  >
                    Book details
                  </a>
                ) : null}
                {isOwner && isCurrentPlanned ? (
                  <button
                    type="button"
                    disabled={actionInProgress === currentCycle.id}
                    onClick={() => onStart(currentCycle)}
                    className="app-button-primary w-full disabled:opacity-60 sm:w-auto"
                  >
                    Start cycle
                  </button>
                ) : null}
                {isOwner && (isCurrentActive || isCurrentPlanned) ? (
                  <button
                    type="button"
                    onClick={() => onEdit(currentCycle)}
                    className="app-button-secondary w-full sm:w-auto"
                  >
                    Edit schedule
                  </button>
                ) : null}
                {isOwner && isCurrentActive ? (
                  <button
                    type="button"
                    disabled={actionInProgress === currentCycle.id}
                    onClick={() => onComplete(currentCycle)}
                    className="app-button-primary w-full disabled:opacity-60 sm:w-auto"
                  >
                    Complete
                  </button>
                ) : null}
                {isOwner && (isCurrentActive || isCurrentPlanned) ? (
                  <button
                    type="button"
                    disabled={actionInProgress === currentCycle.id}
                    onClick={() => onCancel(currentCycle)}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[rgba(196,95,95,0.45)] px-4 py-2 text-sm text-[var(--app-text-primary)] transition hover:border-[var(--app-danger)] sm:w-auto"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {isMember ? (
            <ReadingProgressPanel
              cycle={currentCycle}
              progress={progress}
              isLoading={isProgressLoading}
              error={progressError}
              isSaving={isProgressSaving}
              onRetry={onRetryProgress}
              onUpdate={onUpdateProgress}
            />
          ) : null}
        </div>
      ) : (
        <div className="p-8 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-[var(--app-accent-gold)]" />
          <p className="break-words font-serif text-2xl text-[var(--app-text-primary)] sm:text-3xl">
            No book selected yet
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--app-text-secondary)]">
            {isOwner
              ? "Choose the first book and give this club a shared reading rhythm."
              : isMember
                ? "The club owner has not selected the next read yet."
                : "This club has not announced a current read yet."}
          </p>
          {isOwner ? (
            <button
              type="button"
              onClick={onCreate}
              className="app-button-primary mt-5 w-full sm:w-auto"
            >
              Choose the first book
            </button>
          ) : null}
        </div>
      )}

      {completedCycles.length > 0 ? (
        <div className="border-t border-[var(--app-border-subtle)] p-5 md:p-6">
          <h3 className="font-serif text-2xl text-[var(--app-text-primary)]">
            Reading History
          </h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {completedCycles.map((cycle) => (
              <article
                key={cycle.id}
                className="app-choice-row grid min-w-0 grid-cols-[58px_minmax(0,1fr)] gap-3 rounded-xl p-3"
              >
                <div className="aspect-[2/3] overflow-hidden rounded-lg bg-[var(--app-surface-subtle)]">
                  {cycle.book.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cycle.book.coverImage}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="break-words font-serif text-lg leading-tight text-[var(--app-text-primary)]">
                    {cycle.book.title}
                  </p>
                  <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                    {getAuthorsLabel(cycle.book.authors)}
                  </p>
                  <p className="mt-2 text-xs text-[var(--app-accent-gold)]">
                    Completed{" "}
                    {cycle.completedAt
                      ? formatDate(cycle.completedAt)
                      : formatDate(cycle.updatedAt)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
