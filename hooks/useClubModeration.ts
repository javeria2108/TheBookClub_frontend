import { useState, useCallback } from "react";
import {
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  updateMemberRole,
} from "@/lib/clubs";
import { toast } from "@/components/ui/use-toast";

export interface JoinRequest {
  id: string;
  userId: string;
  username: string;
  email: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt?: string;
}

export function useClubModeration(clubId: string) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const data = await getJoinRequests(clubId);
      setRequests(data);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to load requests",
        description: err instanceof Error ? err.message : "Failed to load requests",
      });
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  const approveRequest = async (requestId: string) => {
    setActionInProgress(requestId);
    try {
      await approveJoinRequest(clubId, requestId);
      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "APPROVED" } : req,
        ),
      );
      toast({
        title: "Request approved",
        description: "The member has been added to the club.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to approve request",
        description: err instanceof Error ? err.message : "Failed to approve request",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const rejectRequest = async (requestId: string) => {
    setActionInProgress(requestId);
    try {
      await rejectJoinRequest(clubId, requestId);
      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "REJECTED" } : req,
        ),
      );
      toast({
        title: "Request rejected",
        description: "The join request was removed.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to reject request",
        description: err instanceof Error ? err.message : "Failed to reject request",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const changeUserRole = async (userId: string, role: "MEMBER" | "MODERATOR") => {
    setActionInProgress(userId);
    try {
      await updateMemberRole(clubId, userId, role);
      toast({
        title: "Member role updated",
        description:
          role === "MODERATOR"
            ? "The member is now a moderator."
            : "The member is now a regular member.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to update member role",
        description: err instanceof Error ? err.message : "Failed to update member role",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  return {
    requests,
    loading,
    actionInProgress,
    loadRequests,
    approveRequest,
    rejectRequest,
    changeUserRole,
  };
}
