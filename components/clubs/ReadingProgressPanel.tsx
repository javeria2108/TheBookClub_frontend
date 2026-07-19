"use client";

import { useId, useState } from "react";
import {
  CheckCircle2,
  RefreshCw,
  Save,
  SlidersHorizontal,
  UserCircle2,
} from "lucide-react";

import { ErrorState, SectionHeader, StatusBadge } from "@/components/ui/app-primitives";
import type {
  ReadingCycle,
  ReadingProgressMember,
  ReadingProgressResponse,
  ReadingProgressStatus,
} from "@/lib/types";

type ReadingProgressPanelProps = {
  cycle: ReadingCycle;
  progress: ReadingProgressResponse | null;
  isLoading: boolean;
  error: string;
  isSaving: boolean;
  onRetry: () => void;
  onUpdate: (progressPercentage: number) => Promise<void>;
};

const QUICK_VALUES = [0, 25, 50, 75, 100] as const;

function getStatusLabel(status: ReadingProgressStatus) {
  if (status === "COMPLETED") return "Completed";
  if (status === "IN_PROGRESS") return "Reading";
  return "Not started";
}

function getStatusTone(status: ReadingProgressStatus) {
  if (status === "COMPLETED") return "success";
  if (status === "IN_PROGRESS") return "teal";
  return "muted";
}

function formatDateTime(value: string | null) {
  if (!value) return "Not updated yet";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getReadOnlyMessage(cycle: ReadingCycle, percentage: number) {
  if (cycle.status === "PLANNED") {
    return "Progress will open when this reading cycle begins.";
  }

  if (cycle.status === "COMPLETED") {
    return `This reading cycle has ended. Your final progress was ${percentage}%.`;
  }

  if (cycle.status === "CANCELLED") {
    return "This reading cycle was cancelled. Progress is read-only.";
  }

  return "";
}

function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      role="progressbar"
      className="h-3 overflow-hidden rounded-full border border-[var(--app-border-subtle)] bg-[rgba(8,11,10,0.66)]"
    >
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,var(--app-accent-teal),var(--app-accent-gold))]"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function ProgressSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="app-surface min-h-64 animate-pulse rounded-2xl" />
      <div className="app-surface min-h-64 animate-pulse rounded-2xl" />
      <div className="app-surface min-h-72 animate-pulse rounded-2xl lg:col-span-2" />
    </div>
  );
}

function YourProgressCard({
  cycle,
  progress,
  isSaving,
  onUpdate,
}: {
  cycle: ReadingCycle;
  progress: ReadingProgressResponse["ownProgress"];
  isSaving: boolean;
  onUpdate: (progressPercentage: number) => Promise<void>;
}) {
  const sliderId = useId();
  const [draftProgress, setDraftProgress] = useState(
    progress.progressPercentage,
  );
  const isEditable = cycle.status === "ACTIVE";
  const readOnlyMessage = getReadOnlyMessage(
    cycle,
    progress.progressPercentage,
  );
  const hasDraftChange = draftProgress !== progress.progressPercentage;

  return (
    <section className="app-surface min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5">
      <SectionHeader
        title="Your progress"
        description="Track your own reading without depending on page counts."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-serif text-4xl leading-none text-[var(--app-text-primary)]">
            {progress.progressPercentage}%
          </p>
          <p className="mt-2 text-sm text-[var(--app-text-secondary)]">
            {progress.progressPercentage}% complete
          </p>
        </div>
        <StatusBadge tone={getStatusTone(progress.status)}>
          {getStatusLabel(progress.status)}
        </StatusBadge>
      </div>

      <div className="mt-5">
        <ProgressBar
          value={progress.progressPercentage}
          label="Your reading progress"
        />
      </div>

      <p className="mt-3 text-xs text-[var(--app-text-muted)]" aria-live="polite">
        Last updated: {formatDateTime(progress.updatedAt)}
      </p>

      {isEditable ? (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {QUICK_VALUES.map((value) => {
              const selected = progress.progressPercentage === value;
              const label = value === 0 ? "Not started" : value === 100 ? "Completed" : `${value}%`;

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  disabled={isSaving || selected}
                  onClick={() => onUpdate(value)}
                  className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${
                    selected
                      ? "border-[var(--app-accent-gold)] bg-[var(--app-accent-teal-soft)] text-[var(--app-accent-gold-hover)]"
                      : "border-[var(--app-border-subtle)] bg-[rgba(8,11,10,0.36)] text-[var(--app-text-secondary)] hover:border-[var(--app-accent-gold)] hover:text-[var(--app-text-primary)]"
                  }`}
                >
                  {selected ? <CheckCircle2 className="mx-auto mb-1 h-4 w-4" /> : null}
                  {label}
                </button>
              );
            })}
          </div>

          <div className="app-choice-row rounded-xl p-4">
            <label
              htmlFor={sliderId}
              className="flex items-center gap-2 text-sm font-semibold text-[var(--app-text-primary)]"
            >
              <SlidersHorizontal className="h-4 w-4 text-[var(--app-accent-gold)]" />
              Fine tune progress
            </label>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                id={sliderId}
                type="range"
                min={0}
                max={100}
                step={1}
                value={draftProgress}
                disabled={isSaving}
                onChange={(event) => setDraftProgress(Number(event.target.value))}
                className="h-11 flex-1 accent-[var(--app-accent-gold)]"
                aria-valuetext={`${draftProgress}% complete`}
              />
              <div className="flex items-center gap-2">
                <output
                  htmlFor={sliderId}
                  className="min-w-14 rounded-lg border border-[var(--app-border-subtle)] px-3 py-2 text-center text-sm font-semibold text-[var(--app-text-primary)]"
                >
                  {draftProgress}%
                </output>
                <button
                  type="button"
                  disabled={isSaving || !hasDraftChange}
                  onClick={() => onUpdate(draftProgress)}
                  className="app-button-secondary min-w-28 disabled:opacity-55"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={isSaving || progress.progressPercentage === 100}
            onClick={() => onUpdate(100)}
            className="app-button-primary w-full disabled:opacity-55 sm:w-auto"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isSaving ? "Saving..." : "Mark Complete"}
          </button>
        </div>
      ) : (
        <p className="app-choice-row mt-5 rounded-xl p-4 text-sm leading-6 text-[var(--app-text-secondary)]">
          {readOnlyMessage}
        </p>
      )}
    </section>
  );
}

function ClubProgressCard({
  progress,
}: {
  progress: ReadingProgressResponse;
}) {
  const { summary } = progress;

  return (
    <section className="app-surface min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5">
      <SectionHeader title="Club progress" />
      <div className="space-y-4">
        <div>
          <div className="flex items-end justify-between gap-3">
            <p className="text-sm text-[var(--app-text-secondary)]">
              Average progress
            </p>
            <p className="font-serif text-3xl text-[var(--app-text-primary)]">
              {summary.averageProgressPercentage}%
            </p>
          </div>
          <div className="mt-3">
            <ProgressBar
              value={summary.averageProgressPercentage}
              label="Club average reading progress"
            />
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3">
          <div className="app-choice-row rounded-xl p-3">
            <dt className="text-xs text-[var(--app-text-muted)]">Started</dt>
            <dd className="mt-1 text-lg font-semibold">
              {summary.startedMembers} of {summary.totalMembers}
            </dd>
          </div>
          <div className="app-choice-row rounded-xl p-3">
            <dt className="text-xs text-[var(--app-text-muted)]">Completed</dt>
            <dd className="mt-1 text-lg font-semibold">
              {summary.completedMembers}
            </dd>
          </div>
          <div className="app-choice-row rounded-xl p-3">
            <dt className="text-xs text-[var(--app-text-muted)]">Reading</dt>
            <dd className="mt-1 text-lg font-semibold">
              {summary.inProgressMembers}
            </dd>
          </div>
          <div className="app-choice-row rounded-xl p-3">
            <dt className="text-xs text-[var(--app-text-muted)]">Members</dt>
            <dd className="mt-1 text-lg font-semibold">
              {summary.totalMembers}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function Avatar({ member }: { member: ReadingProgressMember }) {
  if (member.user.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.user.avatarUrl}
        alt=""
        className="h-11 w-11 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--app-border-subtle)] bg-[var(--app-accent-teal-soft)]">
      <UserCircle2 className="h-6 w-6 text-[var(--app-accent-gold)]" />
    </div>
  );
}

function MemberProgressList({
  progress,
}: {
  progress: ReadingProgressResponse;
}) {
  const hasStartedProgress = progress.summary.startedMembers > 0;

  return (
    <section className="app-surface min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5 lg:col-span-2">
      <SectionHeader
        title="Member progress"
        description="Current members are shown without rankings or email addresses."
      />
      {!hasStartedProgress ? (
        <p className="app-choice-row mb-4 rounded-xl p-4 text-sm text-[var(--app-text-secondary)]">
          Be the first to update your reading progress.
        </p>
      ) : null}
      <div className="space-y-3">
        {progress.members.map((member) => (
          <article
            key={member.user.id}
            className="app-choice-row grid min-w-0 gap-3 rounded-xl p-3 sm:grid-cols-[auto_minmax(0,1fr)_minmax(170px,240px)] sm:items-center"
          >
            <Avatar member={member} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="break-words text-sm font-semibold text-[var(--app-text-primary)]">
                  {member.user.name}
                </h3>
                <StatusBadge tone={getStatusTone(member.status)}>
                  {getStatusLabel(member.status)}
                </StatusBadge>
              </div>
              <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                Last updated: {formatDateTime(member.updatedAt)}
              </p>
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex justify-between gap-3 text-sm">
                <span className="text-[var(--app-text-secondary)]">Progress</span>
                <span className="font-semibold text-[var(--app-text-primary)]">
                  {member.progressPercentage}%
                </span>
              </div>
              <ProgressBar
                value={member.progressPercentage}
                label={`${member.user.name}'s reading progress`}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ReadingProgressPanel({
  cycle,
  progress,
  isLoading,
  error,
  isSaving,
  onRetry,
  onUpdate,
}: ReadingProgressPanelProps) {
  if (isLoading) {
    return <ProgressSkeleton />;
  }

  if (error && !progress) {
    return (
      <ErrorState
        title="Unable to load reading progress"
        description={error}
        action={
          <button type="button" onClick={onRetry} className="app-button-secondary">
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        }
      />
    );
  }

  if (!progress) {
    return null;
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-[rgba(196,95,95,0.45)] bg-[rgba(196,95,95,0.10)] p-4 text-sm text-[var(--app-text-secondary)]"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="app-button-secondary w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      ) : null}
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <YourProgressCard
          key={`${progress.ownProgress.progressPercentage}-${progress.ownProgress.updatedAt ?? "empty"}`}
          cycle={cycle}
          progress={progress.ownProgress}
          isSaving={isSaving}
          onUpdate={onUpdate}
        />
        <ClubProgressCard progress={progress} />
        <MemberProgressList progress={progress} />
      </div>
    </div>
  );
}
