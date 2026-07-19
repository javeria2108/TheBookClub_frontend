"use client";

import { useState } from "react";
import { ChevronDown, Shield, User, Users } from "lucide-react";

import type { ClubMemberSummary } from "@/lib/types";

interface MembersPanelProps {
  members: ClubMemberSummary[];
  loading: boolean;
  actionInProgress: string | null;
  currentUserRole: "OWNER" | "MODERATOR" | "MEMBER";
  onPromote: (
    userId: string,
    username: string,
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  onDemote: (
    userId: string,
    username: string,
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  onRefresh: () => void;
  showEmails?: boolean;
}

export default function MembersPanel({
  members,
  loading,
  actionInProgress,
  currentUserRole,
  onPromote,
  onDemote,
  onRefresh,
  showEmails = false,
}: MembersPanelProps) {
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const canManageRoles = currentUserRole === "OWNER";

  return (
    <div className="app-surface rounded-2xl p-5 md:p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[var(--app-accent-gold)]" />
          <h2 className="font-serif text-2xl text-[var(--app-text-primary)]">
            Members ({members.length})
          </h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg px-3 py-2 text-xs text-[var(--app-accent-gold)] hover:bg-[rgba(216,181,109,0.08)] disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-xl bg-[rgba(244,234,216,0.06)]"
            />
          ))}
        </div>
      ) : members.length === 0 ? (
        <p className="text-center text-sm text-[var(--app-text-secondary)]">
          No members yet.
        </p>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.userId}
              className="flex flex-col gap-3 rounded-xl border border-[var(--app-border-subtle)] bg-[rgba(8,11,10,0.34)] p-4 transition hover:bg-[rgba(8,11,10,0.52)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="break-words font-medium text-[var(--app-text-primary)]">
                    {member.username}
                  </span>
                  {member.role === "OWNER" ? (
                    <RoleBadge label="Owner" />
                  ) : member.role === "MODERATOR" ? (
                    <RoleBadge label="Moderator" />
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(216,181,109,0.10)] px-2 py-0.5 text-xs text-[var(--app-accent-gold)]">
                      <User className="h-3 w-3" />
                      Member
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                  {showEmails ? `${member.email} | ` : ""}
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </p>
              </div>

              {canManageRoles && member.role !== "OWNER" ? (
                <div className="relative self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedUserId(
                        expandedUserId === member.userId ? null : member.userId,
                      )
                    }
                    disabled={actionInProgress === member.userId}
                    className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[var(--app-border-subtle)] px-3 py-2 text-xs text-[var(--app-accent-gold)] hover:bg-[rgba(216,181,109,0.08)] disabled:opacity-50"
                    aria-expanded={expandedUserId === member.userId}
                    aria-label={`Manage ${member.username}`}
                  >
                    {actionInProgress === member.userId
                      ? "Updating..."
                      : "Manage"}
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {expandedUserId === member.userId ? (
                    <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] p-1 shadow-lg">
                      {member.role === "MEMBER" ? (
                        <button
                          type="button"
                          onClick={() => {
                            void onPromote(member.userId, member.username);
                            setExpandedUserId(null);
                          }}
                          disabled={actionInProgress === member.userId}
                          className="block w-full rounded px-3 py-2 text-left text-xs text-[var(--app-accent-gold)] hover:bg-[rgba(216,181,109,0.08)] disabled:opacity-50"
                        >
                          Make Moderator
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            void onDemote(member.userId, member.username);
                            setExpandedUserId(null);
                          }}
                          disabled={actionInProgress === member.userId}
                          className="block w-full rounded px-3 py-2 text-left text-xs text-[var(--app-accent-gold)] hover:bg-[rgba(216,181,109,0.08)] disabled:opacity-50"
                        >
                          Demote to Member
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RoleBadge({ label }: { label: "Owner" | "Moderator" }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(216,181,109,0.16)] px-2 py-0.5 text-xs font-semibold text-[var(--app-accent-gold-hover)]">
      <Shield className="h-3 w-3" />
      {label}
    </span>
  );
}
