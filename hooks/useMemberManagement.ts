import { useCallback, useState } from "react";
import { updateMemberRole } from "@/lib/clubs";
import type { ClubMemberSummary } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";

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
        toast({
          title: "Member promoted",
          description: `${username} is now a moderator.`,
        });
        return { success: true, message: `${username} is now a moderator` };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to promote member";
        toast({
          variant: "destructive",
          title: "Failed to promote member",
          description: message,
        });
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
        toast({
          title: "Member demoted",
          description: `${username} is now a regular member.`,
        });
        return { success: true, message: `${username} is now a regular member` };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to demote member";
        toast({
          variant: "destructive",
          title: "Failed to demote member",
          description: message,
        });
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
