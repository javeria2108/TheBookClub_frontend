import { useState } from "react";
import { joinClub as requestJoinClub } from "@/lib/clubs";

type JoinableClub = {
  id: string;
  name: string;
  isPublic?: boolean;
  isPrivate?: boolean;
};

interface UseJoinClubActionOptions<TClub extends JoinableClub> {
  isAuthenticated: boolean;
  onUnauthenticatedJoin?: (club: TClub) => void;
  onSuccess?: (club: TClub, memberCount: number) => void;
}

export function useJoinClubAction<TClub extends JoinableClub>({
  isAuthenticated,
  onUnauthenticatedJoin,
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

    if (club.isPrivate || club.isPublic === false) {
      setFeedbackMessage("Private club join requests are coming soon.");
      return;
    }

    try {
      setFeedbackMessage(null);
      setJoiningClubId(club.id);

      const data = await requestJoinClub(club.id);

      onSuccess?.(club, data.memberCount);
      setFeedbackMessage(`You joined ${club.name}.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to join club";
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
  };
}