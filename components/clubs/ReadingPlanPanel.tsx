"use client";

import { useId, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Edit3,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { EmptyState, ErrorState, SectionHeader, StatusBadge } from "@/components/ui/app-primitives";
import type {
  CreateReadingTargetPayload,
  ReadingCycle,
  ReadingTarget,
  ReadingTargetType,
} from "@/lib/types";

type ReadingTargetDraft = {
  title: string;
  targetType: ReadingTargetType;
  description: string;
  startValue: string;
  endValue: string;
  startDate: string;
  endDate: string;
};

type ReadingPlanPanelProps = {
  cycle: ReadingCycle;
  targets: ReadingTarget[];
  isOwner: boolean;
  isLoading: boolean;
  error: string;
  actionInProgress: string;
  onRetry: () => void;
  onCreate: (payload: CreateReadingTargetPayload) => Promise<void>;
  onUpdate: (
    targetId: string,
    payload: CreateReadingTargetPayload,
  ) => Promise<void>;
  onDelete: (target: ReadingTarget) => Promise<void>;
  onMove: (targetId: string, direction: "up" | "down") => Promise<void>;
};

const TARGET_TYPE_OPTIONS: Array<{ label: string; value: ReadingTargetType }> = [
  { label: "Chapters", value: "CHAPTERS" },
  { label: "Pages", value: "PAGES" },
  { label: "Custom", value: "CUSTOM" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function toDateTimeInputValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function dateTimeInputToIso(value: string) {
  return new Date(value).toISOString();
}

function createEmptyDraft(cycle: ReadingCycle): ReadingTargetDraft {
  return {
    title: "",
    targetType: "CHAPTERS",
    description: "",
    startValue: "1",
    endValue: "1",
    startDate: toDateTimeInputValue(cycle.startDate),
    endDate: toDateTimeInputValue(cycle.targetEndDate),
  };
}

function draftFromTarget(target: ReadingTarget): ReadingTargetDraft {
  return {
    title: target.title,
    targetType: target.targetType,
    description: target.description ?? "",
    startValue: target.startValue ? String(target.startValue) : "1",
    endValue: target.endValue ? String(target.endValue) : "1",
    startDate: toDateTimeInputValue(target.startDate),
    endDate: toDateTimeInputValue(target.endDate),
  };
}

function getStateLabel(state: ReadingTarget["state"]) {
  if (state === "CURRENT") return "Current";
  if (state === "PREVIOUS") return "Previous";
  return "Upcoming";
}

function getStateTone(state: ReadingTarget["state"]) {
  if (state === "CURRENT") return "teal";
  if (state === "PREVIOUS") return "muted";
  return "gold";
}

function getRelativeDateText(target: ReadingTarget) {
  const now = new Date();
  const start = new Date(target.startDate);
  const end = new Date(target.endDate);
  const dayMs = 1000 * 60 * 60 * 24;

  if (target.state === "UPCOMING") {
    const days = Math.max(1, Math.ceil((start.getTime() - now.getTime()) / dayMs));
    return `Starts in ${days} day${days === 1 ? "" : "s"}`;
  }

  if (target.state === "CURRENT") {
    const days = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / dayMs));
    if (days === 0) return "Ends today";
    return `${days} day${days === 1 ? "" : "s"} remaining`;
  }

  return "Reading period ended";
}

function findFeaturedTarget(targets: ReadingTarget[]) {
  return (
    targets.find((target) => target.state === "CURRENT") ??
    targets.find((target) => target.state === "UPCOMING") ??
    targets[targets.length - 1] ??
    null
  );
}

function validateDraft(draft: ReadingTargetDraft): string {
  if (!draft.title.trim()) return "Title is required.";
  if (!draft.startDate || !draft.endDate) return "Choose start and end dates.";

  if (new Date(draft.endDate) <= new Date(draft.startDate)) {
    return "End date must be after start date.";
  }

  if (draft.targetType === "CUSTOM") {
    if (!draft.description.trim()) {
      return "Enter a description for this custom reading goal.";
    }
    return "";
  }

  const rangeLabel = draft.targetType === "CHAPTERS" ? "chapter" : "page";
  const startValue = Number(draft.startValue);
  const endValue = Number(draft.endValue);

  if (!Number.isInteger(startValue) || startValue < 1) {
    return `Start ${rangeLabel} must be a positive whole number.`;
  }

  if (!Number.isInteger(endValue) || endValue < 1) {
    return `End ${rangeLabel} must be a positive whole number.`;
  }

  if (endValue < startValue) {
    return `End ${rangeLabel} must be greater than or equal to start ${rangeLabel}.`;
  }

  return "";
}

function toPayload(draft: ReadingTargetDraft): CreateReadingTargetPayload {
  const basePayload = {
    targetType: draft.targetType,
    title: draft.title.trim(),
    description: draft.description.trim() || null,
    startDate: dateTimeInputToIso(draft.startDate),
    endDate: dateTimeInputToIso(draft.endDate),
  };

  if (draft.targetType === "CUSTOM") {
    return {
      ...basePayload,
      startValue: null,
      endValue: null,
    };
  }

  return {
    ...basePayload,
    startValue: Number(draft.startValue),
    endValue: Number(draft.endValue),
  };
}

function ReadingTargetDialog({
  cycle,
  target,
  saving,
  onClose,
  onSubmit,
}: {
  cycle: ReadingCycle;
  target: ReadingTarget | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateReadingTargetPayload) => Promise<void>;
}) {
  const titleId = useId();
  const [draft, setDraft] = useState(
    target ? draftFromTarget(target) : createEmptyDraft(cycle),
  );
  const [error, setError] = useState("");

  const isCustom = draft.targetType === "CUSTOM";
  const rangeNoun = draft.targetType === "CHAPTERS" ? "chapter" : "page";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateDraft(draft);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await onSubmit(toPayload(draft));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save target.");
    }
  };

  return (
    <div className="app-modal-backdrop" role="presentation">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="app-modal-panel w-full max-w-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="app-modal-header flex items-start justify-between gap-4 p-4 sm:p-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--app-accent-gold)]">
              Reading plan
            </p>
            <h2 id={titleId} className="mt-1 font-serif text-2xl text-[var(--app-text-primary)]">
              {target ? "Edit target" : "Add target"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="app-button-secondary min-h-10 px-3"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(100dvh-220px)] space-y-4 overflow-y-auto p-4 sm:p-5">
          {error ? (
            <p role="alert" className="rounded-xl border border-[rgba(196,95,95,0.45)] bg-[rgba(196,95,95,0.10)] p-3 text-sm text-[var(--app-text-secondary)]">
              {error}
            </p>
          ) : null}

          <label className="block">
            <span className="app-field-label">Title</span>
            <input
              className="app-input mt-2 w-full px-3"
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Week 1"
            />
          </label>

          <label className="block">
            <span className="app-field-label">Target type</span>
            <select
              className="app-input mt-2 w-full px-3"
              value={draft.targetType}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  targetType: event.target.value as ReadingTargetType,
                }))
              }
            >
              {TARGET_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {!isCustom ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="app-field-label">Start {rangeNoun}</span>
                <input
                  className="app-input mt-2 w-full px-3"
                  type="number"
                  min={1}
                  value={draft.startValue}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      startValue: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="block">
                <span className="app-field-label">End {rangeNoun}</span>
                <input
                  className="app-input mt-2 w-full px-3"
                  type="number"
                  min={1}
                  value={draft.endValue}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      endValue: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
          ) : null}

          <label className="block">
            <span className="app-field-label">Description</span>
            <textarea
              className="app-input mt-2 min-h-28 w-full px-3 py-3"
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Focus on the opening conflict and bring one question to discussion."
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="app-field-label">Start date</span>
              <input
                className="app-input mt-2 w-full px-3"
                type="datetime-local"
                value={draft.startDate}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    startDate: event.target.value,
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="app-field-label">End date</span>
              <input
                className="app-input mt-2 w-full px-3"
                type="datetime-local"
                value={draft.endDate}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    endDate: event.target.value,
                  }))
                }
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--app-border-subtle)] p-4 sm:flex-row sm:justify-end sm:p-5">
          <button type="button" onClick={onClose} className="app-button-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="app-button-primary">
            {saving ? "Saving..." : target ? "Save target" : "Add target"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FeaturedTarget({ target }: { target: ReadingTarget }) {
  const title = target.state === "CURRENT" ? "This week" : target.state === "UPCOMING" ? "Up next" : "Reading plan ended";

  return (
    <section className="app-surface min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5">
      <SectionHeader title={title} />
      <div className={target.state === "CURRENT" ? "rounded-2xl border border-[rgba(26,165,156,0.34)] bg-[rgba(26,165,156,0.08)] p-4" : "app-choice-row rounded-2xl p-4"}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--app-accent-gold)]">
              {target.rangeLabel}
            </p>
            <h3 className="mt-2 break-words font-serif text-2xl text-[var(--app-text-primary)]">
              {target.title}
            </h3>
          </div>
          <StatusBadge tone={getStateTone(target.state)}>
            {getStateLabel(target.state)}
          </StatusBadge>
        </div>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[var(--app-text-secondary)]">
          <CalendarDays className="h-4 w-4 text-[var(--app-accent-gold)]" />
          {formatDate(target.startDate)} to {formatDate(target.endDate)}
          <span className="text-[var(--app-text-muted)]">|</span>
          {getRelativeDateText(target)}
        </p>
        {target.description ? (
          <p className="mt-4 text-sm leading-6 text-[var(--app-text-secondary)]">
            {target.description}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function ReadingPlanPanel({
  cycle,
  targets,
  isOwner,
  isLoading,
  error,
  actionInProgress,
  onRetry,
  onCreate,
  onUpdate,
  onDelete,
  onMove,
}: ReadingPlanPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<ReadingTarget | null>(null);
  const featuredTarget = useMemo(() => findFeaturedTarget(targets), [targets]);
  const canEditPlan = isOwner && !["COMPLETED", "CANCELLED"].includes(cycle.status);

  const openAddDialog = () => {
    setEditingTarget(null);
    setDialogOpen(true);
  };

  const openEditDialog = (target: ReadingTarget) => {
    setEditingTarget(target);
    setDialogOpen(true);
  };

  const handleSubmit = async (payload: CreateReadingTargetPayload) => {
    if (editingTarget) {
      await onUpdate(editingTarget.id, payload);
    } else {
      await onCreate(payload);
    }
    setDialogOpen(false);
    setEditingTarget(null);
  };

  const handleDelete = async (target: ReadingTarget) => {
    if (!window.confirm(`Delete "${target.title}" from the reading plan?`)) {
      return;
    }

    await onDelete(target);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="app-surface min-h-44 animate-pulse rounded-2xl" />
        <div className="app-surface min-h-44 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load reading plan"
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

  return (
    <div className="space-y-4">
      {featuredTarget ? (
        <FeaturedTarget target={featuredTarget} />
      ) : (
        <EmptyState
          title="No reading plan yet"
          description={
            isOwner
              ? "Break this reading cycle into manageable weekly sections."
              : "The owner has not added a detailed reading plan yet."
          }
          action={
            canEditPlan ? (
              <button type="button" onClick={openAddDialog} className="app-button-primary">
                <Plus className="h-4 w-4" />
                Add first target
              </button>
            ) : null
          }
        />
      )}

      {targets.length > 0 ? (
        <section className="app-surface min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5">
          <SectionHeader
            title="Full reading plan"
            action={
              canEditPlan ? (
                <button type="button" onClick={openAddDialog} className="app-button-primary w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Add target
                </button>
              ) : null
            }
          />
          <ol className="space-y-3">
            {targets.map((target, index) => (
              <li
                key={target.id}
                className="app-choice-row grid min-w-0 gap-3 rounded-2xl p-4 md:grid-cols-[auto_minmax(0,1fr)_auto]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--app-border-subtle)] text-sm font-semibold text-[var(--app-accent-gold)]">
                  {target.sequence}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-words font-serif text-xl text-[var(--app-text-primary)]">
                      {target.title}
                    </h3>
                    <StatusBadge tone={getStateTone(target.state)}>
                      {getStateLabel(target.state)}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-[var(--app-accent-gold)]">
                    {target.rangeLabel}
                  </p>
                  <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
                    {formatShortDate(target.startDate)} to {formatShortDate(target.endDate)}
                    <span className="mx-2 text-[var(--app-text-muted)]">|</span>
                    {getRelativeDateText(target)}
                  </p>
                  {target.description ? (
                    <p className="mt-3 text-sm leading-6 text-[var(--app-text-secondary)]">
                      {target.description}
                    </p>
                  ) : null}
                </div>
                {canEditPlan ? (
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <button
                      type="button"
                      disabled={index === 0 || Boolean(actionInProgress)}
                      onClick={() => void onMove(target.id, "up")}
                      className="app-button-secondary min-h-10 px-3 disabled:opacity-50"
                    >
                      <ChevronUp className="h-4 w-4" />
                      Move up
                    </button>
                    <button
                      type="button"
                      disabled={index === targets.length - 1 || Boolean(actionInProgress)}
                      onClick={() => void onMove(target.id, "down")}
                      className="app-button-secondary min-h-10 px-3 disabled:opacity-50"
                    >
                      <ChevronDown className="h-4 w-4" />
                      Move down
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(actionInProgress)}
                      onClick={() => openEditDialog(target)}
                      className="app-button-secondary min-h-10 px-3"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(actionInProgress)}
                      onClick={() => void handleDelete(target)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[rgba(196,95,95,0.45)] px-3 text-sm text-[var(--app-text-primary)] transition hover:border-[var(--app-danger)] disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {dialogOpen ? (
        <ReadingTargetDialog
          key={editingTarget?.id ?? "new-target"}
          cycle={cycle}
          target={editingTarget}
          saving={Boolean(actionInProgress)}
          onClose={() => {
            setDialogOpen(false);
            setEditingTarget(null);
          }}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}
