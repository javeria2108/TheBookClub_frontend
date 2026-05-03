import { useState } from "react";
import { joinClub as requestJoinClub } from "@/lib/clubs";
import { leaveClub as requestLeaveClub } from "@/lib/clubs";

type JoinableClub = {
  id: string;
  name: string;
  isPublic?: boolean;
  isPrivate?: boolean;
  memberCount?: number;
};

interface UseJoinClubActionOptions<TClub extends JoinableClub> {
  isAuthenticated: boolean;
  onUnauthenticatedJoin?: (club: TClub) => void;
  onUnauthenticatedLeave?: (club: TClub) => void;
  onSuccess?: (
    club: TClub,
    memberCount: number,
    action: "join" | "leave",
  ) => void;
}

export function useJoinClubAction<TClub extends JoinableClub>({
  isAuthenticated,
  onUnauthenticatedJoin,
  onUnauthenticatedLeave,
  onSuccess,
}: UseJoinClubActionOptions<TClub>) {
  const [joiningClubId, setJoiningClubId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const clearFeedback = () => setFeedbackMessage(null);

  const join = async (club: TClub) => {
    if (!isAuthenticated) {
      onUnauthenticatedJoin?.(club);
      return;
    }

    try {
      setFeedbackMessage(null);
      setJoiningClubId(club.id);

      const data = await requestJoinClub(club.id);

      if (club.isPrivate || club.isPublic === false) {
        onSuccess?.(club, club.memberCount ?? data.memberCount ?? 0, "join");
        setFeedbackMessage(data.message ?? `Join request sent for ${club.name}.`);
      } else {
        onSuccess?.(club, data.memberCount ?? club.memberCount ?? 0, "join");
        setFeedbackMessage(`You joined ${club.name}.`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to join club";
      setFeedbackMessage(message);
    } finally {
      setJoiningClubId(null);
    }
  };

  const leave = async (club: TClub) => {
    if (!isAuthenticated) {
      onUnauthenticatedLeave?.(club);
      return;
    }

    try {
      setFeedbackMessage(null);
      setJoiningClubId(club.id);

      const data = await requestLeaveClub(club.id);

      onSuccess?.(club, data.memberCount ?? club.memberCount ?? 0, "leave");
      setFeedbackMessage(`You left ${club.name}.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to leave club";
      setFeedbackMessage(message);
    } finally {
      setJoiningClubId(null);
    }
  };

  return {
    joiningClubId,
    feedbackMessage,
    clearFeedback,
    joinClub: join,
    leaveClub: leave,
  };
}
