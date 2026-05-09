"use client";

import type { ClubMemberSummary } from "@/lib/types";
import { Users, Shield, User, ChevronDown } from "lucide-react";
import { useState } from "react";

interface MembersPanelProps {
  members: ClubMemberSummary[];
  loading: boolean;
  actionInProgress: string | null;
  currentUserRole: "OWNER" | "MODERATOR" | "MEMBER";
  onPromote: (userId: string, username: string) => Promise<{
    success: boolean;
    message: string;
  }>;
  onDemote: (userId: string, username: string) => Promise<{
    success: boolean;
    message: string;
  }>;
  onRefresh: () => void;
}

export default function MembersPanel({
  members,
  loading,
  actionInProgress,
  currentUserRole,
  onPromote,
  onDemote,
  onRefresh,
}: MembersPanelProps) {
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const canManageRoles = currentUserRole === "OWNER";

  const handlePromote = async (userId: string, username: string) => {
    const result = await onPromote(userId, username);
    setFeedback(result.message);
    setTimeout(() => setFeedback(""), 3000);
  };

  const handleDemote = async (userId: string, username: string) => {
    const result = await onDemote(userId, username);
    setFeedback(result.message);
    setTimeout(() => setFeedback(""), 3000);
  };

  return (
    <div className="rounded-2xl border border-[#C9A96E]/25 bg-[#2A1810]/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[#C9A96E]" />
          <h2 className="text-lg font-semibold text-[#F2E8D9]">
            Club Members ({members.length})
          </h2>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded px-3 py-1 text-xs text-[#C9A96E] hover:bg-[#C9A96E]/10 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {feedback && (
        <div className="mb-4 rounded border border-[#C9A96E]/25 bg-[#1A0F07]/50 px-4 py-2 text-sm text-[#C9A96E]">
          {feedback}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded bg-[#1A0F07]/50"
            />
          ))}
        </div>
      ) : members.length === 0 ? (
        <p className="text-center text-sm text-[#F2E8D9]/60">
          No members yet
        </p>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center justify-between rounded-lg border border-[#C9A96E]/15 bg-[#1A0F07]/40 p-4 hover:bg-[#1A0F07]/60 transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#F2E8D9]">
                    {member.username}
                  </span>
                  {member.role === "OWNER" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#E8A87C]/20 px-2 py-0.5 text-xs font-semibold text-[#E8A87C]">
                      <Shield className="h-3 w-3" />
                      Owner
                    </span>
                  )}
                  {member.role === "MODERATOR" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#D4AF37]/20 px-2 py-0.5 text-xs font-semibold text-[#D4AF37]">
                      <Shield className="h-3 w-3" />
                      Moderator
                    </span>
                  )}
                  {member.role === "MEMBER" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#C9A96E]/15 px-2 py-0.5 text-xs text-[#C9A96E]">
                      <User className="h-3 w-3" />
                      Member
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#F2E8D9]/50">
                  {member.email} • Joined{" "}
                  {new Date(member.joinedAt).toLocaleDateString()}
                </p>
              </div>

              {canManageRoles && member.role !== "OWNER" && (
                <div className="relative">
                  <button
                    onClick={() =>
                      setExpandedUserId(
                        expandedUserId === member.userId ? null : member.userId
                      )
                    }
                    disabled={actionInProgress === member.userId}
                    className="ml-4 inline-flex items-center gap-1 rounded bg-[#C9A96E]/10 px-2 py-1 text-xs text-[#C9A96E] hover:bg-[#C9A96E]/20 disabled:opacity-50"
                  >
                    {actionInProgress === member.userId
                      ? "Updating..."
                      : "Action"}
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {expandedUserId === member.userId && (
                    <div className="absolute right-0 top-full z-10 mt-1 rounded-lg border border-[#C9A96E]/25 bg-[#2A1810] p-1 shadow-lg">
                      {member.role === "MEMBER" ? (
                        <button
                          onClick={() => {
                            handlePromote(member.userId, member.username);
                            setExpandedUserId(null);
                          }}
                          disabled={actionInProgress === member.userId}
                          className="block w-full rounded px-3 py-2 text-left text-xs text-[#C9A96E] hover:bg-[#C9A96E]/10 disabled:opacity-50"
                        >
                          Make Moderator
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            handleDemote(member.userId, member.username);
                            setExpandedUserId(null);
                          }}
                          disabled={actionInProgress === member.userId}
                          className="block w-full rounded px-3 py-2 text-left text-xs text-[#C9A96E] hover:bg-[#C9A96E]/10 disabled:opacity-50"
                        >
                          Demote to Member
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
