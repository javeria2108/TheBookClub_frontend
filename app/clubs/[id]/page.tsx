"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronLeft, Globe, Lock, Users, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { Club } from "@/lib/types";
import { getClubById } from "@/lib/clubs";
import { useAuthState } from "@/hooks/useAuthState";
import { AppHeader } from "@/components/layout/AppHeader";
import { useJoinClubAction } from "@/hooks/useJoinClubAction";
import { useClubModeration } from "@/hooks/useClubModeration";
import JoinRequestsPanel from "@/components/pages/clubs/JoinRequestsPanel";

export default function ClubDetailPage() {
  const params = useParams();
  const clubId = params.id as string;
  const { isAuthenticated, user } = useAuthState();

  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingRequest, setPendingRequest] = useState(false);

  useEffect(() => {
    const loadClub = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getClubById(clubId);
        setClub(response.club);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch club");
      } finally {
        setIsLoading(false);
      }
    };

    loadClub();
  }, [clubId]);

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "R";

  const {
    joiningClubId,
    feedbackMessage,
    joinClub: handleJoinClick,
    leaveClub: handleLeaveClick,
  } = useJoinClubAction<Club>({
    isAuthenticated,
    onSuccess: (joinedClub, memberCount, action) => {
      if (action === "join" && !club?.isPublic) {
        // For private clubs, set pending state
        setPendingRequest(true);
      }
      setClub((current) =>
        current && current.id === joinedClub.id
          ? {
              ...current,
              memberCount,
              isMember: action === "join" && club?.isPublic,
            }
          : current,
      );
    },
  });

  const moderation = useClubModeration(clubId);

  useEffect(() => {
    if (club && club.memberRole && (club.memberRole === "OWNER" || club.memberRole === "MODERATOR")) {
      moderation.loadRequests().catch(() => {
        console.error("Failed to load join requests");
      });
    }
  }, [club, moderation]);

  return (
    <main className="min-h-screen bg-[#1A0F07] text-[#F2E8D9]">
      <AppHeader
        mode="app"
        isAuthenticated={isAuthenticated}
        userInitial={userInitial}
      />

      <section className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-12">
        <Link
          href="/clubs"
          className="inline-flex items-center gap-2 mb-8 text-[#C9A96E] hover:text-[#d8b884] transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Clubs
        </Link>

        {isLoading ? (
          <div className="rounded-2xl border border-[#C9A96E]/20 bg-[#2A1810] p-8 text-center">
            <p className="text-lg">Loading club...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[#8B4A3C]/60 bg-[#8B4A3C]/20 p-6">
            <p className="text-[#F2E8D9]">{error}</p>
          </div>
        ) : club ? (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="rounded-2xl border border-[#C9A96E]/25 bg-[#2A1810]/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] md:p-8"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                    BookCircle Club
                  </p>
                  <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
                    {club.name}
                  </h1>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#C9A96E]/35 px-3 py-1.5 text-[11px] uppercase tracking-wide text-[#C9A96E] whitespace-nowrap">
                  {club.isPublic ? (
                    <Globe className="h-3.5 w-3.5" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                  {club.isPublic ? "Public" : "Private"}
                </span>
              </div>

              <p className="mt-4 text-base text-[#F2E8D9]/80 leading-relaxed max-w-2xl">
                {club.description || "No description available."}
              </p>

              <div className="mt-6 flex flex-wrap gap-4 items-center">
                {isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        club.isMember || pendingRequest
                          ? void handleLeaveClick(club)
                          : void handleJoinClick(club)
                      }
                      disabled={joiningClubId === club.id}
                      className="inline-flex items-center gap-2 rounded bg-[#C9A96E] px-5 py-3 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {joiningClubId === club.id ? (
                        club.isMember || pendingRequest ? "Leaving..." : "Joining..."
                      ) : club.isMember ? (
                        "Leave Club"
                      ) : pendingRequest ? (
                        "Cancel Request"
                      ) : (
                        "Join Club"
                      )}
                    </button>
                    {pendingRequest && (
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A87C]/50 bg-[#E8A87C]/10 px-3 py-1.5">
                        <AlertCircle className="h-4 w-4 text-[#E8A87C]" />
                        <span className="text-xs text-[#E8A87C]">Pending Approval</span>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={`/auth/login?returnTo=${encodeURIComponent(`/clubs/${club.id}`)}`}
                    className="inline-flex items-center gap-2 rounded bg-[#C9A96E] px-5 py-3 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]"
                  >
                    Join Club
                  </Link>
                )}
                <span className="text-sm text-[#F2E8D9]/70">
                  Created {new Date(club.createdAt).toLocaleDateString()}
                </span>
              </div>

              {feedbackMessage ? (
                <p className="mt-4 rounded border border-[#C9A96E]/25 bg-[#1A0F07]/50 px-4 py-3 text-sm text-[#F2E8D9]/80">
                  {feedbackMessage}
                </p>
              ) : null}
            </motion.div>

            {club.memberRole && (club.memberRole === "OWNER" || club.memberRole === "MODERATOR") && !club.isPublic && (
              <JoinRequestsPanel
                clubId={clubId}
                requests={moderation.requests}
                loading={moderation.loading}
                actionInProgress={moderation.actionInProgress}
                onApprove={moderation.approveRequest}
                onReject={moderation.rejectRequest}
                onRefresh={moderation.loadRequests}
              />
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}
                </h1>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#C9A96E]/35 px-3 py-1.5 text-[11px] uppercase tracking-wide text-[#C9A96E] whitespace-nowrap">
                {club.isPublic ? (
                  <Globe className="h-3.5 w-3.5" />
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )}
                {club.isPublic ? "Public" : "Private"}
              </span>
            </div>

            <p className="mt-4 text-base text-[#F2E8D9]/80 leading-relaxed max-w-2xl">
              {club.description || "No description available."}
            </p>

            <div className="mt-6 flex flex-wrap gap-4 items-center">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() =>
                    club.isMember
                      ? void handleLeaveClick(club)
                      : void handleJoinClick(club)
                  }
                  disabled={joiningClubId === club.id}
                  className="inline-flex items-center gap-2 rounded bg-[#C9A96E] px-5 py-3 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {joiningClubId === club.id
                    ? club.isMember
                      ? "Leaving..."
                      : "Joining..."
                    : club.isMember
                      ? "Leave Club"
                      : "Join Club"}
                </button>
              ) : (
                <Link
                  href={`/auth/login?returnTo=${encodeURIComponent(`/clubs/${club.id}`)}`}
                  className="inline-flex items-center gap-2 rounded bg-[#C9A96E] px-5 py-3 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]"
                >
                  Join Club
                </Link>
              )}
              <span className="text-sm text-[#F2E8D9]/70">
                Created {new Date(club.createdAt).toLocaleDateString()}
              </span>
            </div>

            {feedbackMessage ? (
              <p className="mt-4 rounded border border-[#C9A96E]/25 bg-[#1A0F07]/50 px-4 py-3 text-sm text-[#F2E8D9]/80">
                {feedbackMessage}
              </p>
            ) : null}
          </motion.div>
        ) : null}
      </section>
    </main>
  );
}
