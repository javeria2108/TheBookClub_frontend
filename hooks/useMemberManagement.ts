import { useCallback, useState } from "react";
import { updateMemberRole } from "@/lib/clubs";
import type { ClubMemberSummary } from "@/lib/types";

export function useMemberManagement(clubId: string) {
  const [members, setMembers] = useState<ClubMemberSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const promoteToModerator = useCallback(
    async (userId: string, username: string) => {
      try {
        setActionInProgress(userId);
        await updateMemberRole(clubId, userId, "MODERATOR");
        setMembers((prev) =>
          prev.map((m) => (m.userId === userId ? { ...m, role: "MODERATOR" } : m))
        );
        return { success: true, message: `${username} is now a moderator` };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to promote member";
        return { success: false, message };
      } finally {
        setActionInProgress(null);
      }
    },
    [clubId]
  );

  const demoteToMember = useCallback(
    async (userId: string, username: string) => {
      try {
        setActionInProgress(userId);
        await updateMemberRole(clubId, userId, "MEMBER");
        setMembers((prev) =>
          prev.map((m) => (m.userId === userId ? { ...m, role: "MEMBER" } : m))
        );
        return { success: true, message: `${username} is now a regular member` };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to demote member";
        return { success: false, message };
      } finally {
        setActionInProgress(null);
      }
    },
    [clubId]
  );

  return {
    members,
    setMembers,
    loading,
    setLoading,
    actionInProgress,
    promoteToModerator,
    demoteToMember,
  };
}
