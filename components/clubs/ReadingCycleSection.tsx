"use client";

import { BookOpen, CalendarDays, CheckCircle2, Clock, XCircle } from "lucide-react";

import type { ReadingCycle } from "@/lib/types";

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
}: ReadingCycleSectionProps) {
  const isCurrentPlanned = currentCycle?.status === "PLANNED";
  const isCurrentActive = currentCycle?.status === "ACTIVE";

  return (
    <section className="overflow-hidden rounded-2xl border border-[#C9A96E]/25 bg-[#100904] shadow-[0_24px_70px_rgba(0,0,0,0.42)]">
      <div className="border-b border-[#C9A96E]/15 bg-[#2A1810]/80 p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
              Club Reading
            </p>
            <h2 className="mt-1 font-serif text-3xl text-[#F2E8D9]">
              Shared Reading Cycle
            </h2>
          </div>
          {isOwner ? (
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex items-center justify-center rounded-lg bg-[#C9A96E] px-4 py-3 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]"
            >
              {currentCycle ? "Plan next read" : "Choose the first book"}
            </button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 p-6 md:grid-cols-[170px_1fr]">
          <div className="aspect-[2/3] animate-pulse rounded-xl bg-[#2A1810]" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-[#2A1810]" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-[#2A1810]" />
            <div className="h-24 animate-pulse rounded bg-[#2A1810]" />
          </div>
        </div>
      ) : currentCycle ? (
        <div className="grid gap-6 p-5 md:grid-cols-[180px_1fr] md:p-6">
          <div className="aspect-[2/3] overflow-hidden rounded-xl border border-[#C9A96E]/25 bg-[#1A0F07]">
            {currentCycle.book.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentCycle.book.coverImage}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <BookOpen className="h-12 w-12 text-[#C9A96E]/70" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <span className="inline-flex rounded-full border border-[#C9A96E]/35 px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#C9A96E]">
              {getStatusLabel(currentCycle.status)}
            </span>
            <h3 className="mt-4 font-serif text-4xl leading-tight text-[#F2E8D9]">
              {currentCycle.book.title}
            </h3>
            <p className="mt-2 text-sm text-[#F2E8D9]/65">
              {getAuthorsLabel(currentCycle.book.authors)}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#C9A96E]/15 bg-[#1A0F07]/75 p-4">
                <CalendarDays className="mb-2 h-4 w-4 text-[#C9A96E]" />
                <p className="text-sm text-[#F2E8D9]">
                  {formatDate(currentCycle.startDate)}
                </p>
                <p className="mt-1 text-xs text-[#F2E8D9]/55">Start date</p>
              </div>
              <div className="rounded-xl border border-[#C9A96E]/15 bg-[#1A0F07]/75 p-4">
                <Clock className="mb-2 h-4 w-4 text-[#C9A96E]" />
                <p className="text-sm text-[#F2E8D9]">
                  {formatDate(currentCycle.targetEndDate)}
                </p>
                <p className="mt-1 text-xs text-[#F2E8D9]/55">Target end</p>
              </div>
              <div className="rounded-xl border border-[#C9A96E]/15 bg-[#1A0F07]/75 p-4">
                <CheckCircle2 className="mb-2 h-4 w-4 text-[#C9A96E]" />
                <p className="text-sm text-[#F2E8D9]">
                  {currentCycle.status === "COMPLETED" &&
                  currentCycle.completedAt
                    ? formatDate(currentCycle.completedAt)
                    : getDaysRemaining(currentCycle.targetEndDate)}
                </p>
                <p className="mt-1 text-xs text-[#F2E8D9]/55">Timeline</p>
              </div>
            </div>

            {currentCycle.goalDescription ? (
              <p className="mt-5 rounded-xl border border-[#C9A96E]/15 bg-[#2A1810]/70 p-4 text-sm leading-6 text-[#F2E8D9]/75">
                {currentCycle.goalDescription}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              {currentCycle.book.previewUrl ? (
                <a
                  href={currentCycle.book.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-[#C9A96E]/30 px-4 py-2 text-sm text-[#F2E8D9] transition hover:border-[#C9A96E]"
                >
                  Preview
                </a>
              ) : null}
              {currentCycle.book.infoUrl ? (
                <a
                  href={currentCycle.book.infoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-[#C9A96E]/30 px-4 py-2 text-sm text-[#F2E8D9] transition hover:border-[#C9A96E]"
                >
                  Book details
                </a>
              ) : null}
              {isOwner && isCurrentPlanned ? (
                <button
                  type="button"
                  disabled={actionInProgress === currentCycle.id}
                  onClick={() => onStart(currentCycle)}
                  className="rounded-lg bg-[#C9A96E] px-4 py-2 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884] disabled:opacity-60"
                >
                  Start cycle
                </button>
              ) : null}
              {isOwner && (isCurrentActive || isCurrentPlanned) ? (
                <button
                  type="button"
                  onClick={() => onEdit(currentCycle)}
                  className="rounded-lg border border-[#C9A96E]/30 px-4 py-2 text-sm text-[#F2E8D9] transition hover:border-[#C9A96E]"
                >
                  Edit schedule
                </button>
              ) : null}
              {isOwner && isCurrentActive ? (
                <button
                  type="button"
                  disabled={actionInProgress === currentCycle.id}
                  onClick={() => onComplete(currentCycle)}
                  className="rounded-lg bg-[#C9A96E] px-4 py-2 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884] disabled:opacity-60"
                >
                  Complete
                </button>
              ) : null}
              {isOwner && (isCurrentActive || isCurrentPlanned) ? (
                <button
                  type="button"
                  disabled={actionInProgress === currentCycle.id}
                  onClick={() => onCancel(currentCycle)}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#D35454]/45 px-4 py-2 text-sm text-[#F2E8D9] transition hover:border-[#D35454]"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-[#C9A96E]" />
          <p className="font-serif text-3xl text-[#F2E8D9]">
            No book selected yet
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#F2E8D9]/70">
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
              className="mt-5 rounded-lg bg-[#C9A96E] px-4 py-3 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]"
            >
              Choose the first book
            </button>
          ) : null}
        </div>
      )}

      {completedCycles.length > 0 ? (
        <div className="border-t border-[#C9A96E]/15 p-5 md:p-6">
          <h3 className="font-serif text-2xl text-[#F2E8D9]">
            Reading History
          </h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {completedCycles.map((cycle) => (
              <article
                key={cycle.id}
                className="grid grid-cols-[58px_1fr] gap-3 rounded-xl border border-[#C9A96E]/15 bg-[#2A1810]/65 p-3"
              >
                <div className="aspect-[2/3] overflow-hidden rounded-lg bg-[#1A0F07]">
                  {cycle.book.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cycle.book.coverImage}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div>
                  <p className="font-serif text-lg leading-tight text-[#F2E8D9]">
                    {cycle.book.title}
                  </p>
                  <p className="mt-1 text-xs text-[#F2E8D9]/60">
                    {getAuthorsLabel(cycle.book.authors)}
                  </p>
                  <p className="mt-2 text-xs text-[#C9A96E]">
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
