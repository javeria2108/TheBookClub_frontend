import { useState } from "react";
import {
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  updateMemberRole,
} from "@/lib/clubs";

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
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadRequests = async () => {
    if (!clubId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getJoinRequests(clubId);
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve request");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject request");
    } finally {
      setActionInProgress(null);
    }
  };

  const changeUserRole = async (userId: string, role: "MEMBER" | "MODERATOR") => {
    setActionInProgress(userId);
    try {
      await updateMemberRole(clubId, userId, role);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update member role",
      );
    } finally {
      setActionInProgress(null);
    }
  };

  return {
    requests,
    loading,
    error,
    actionInProgress,
    loadRequests,
    approveRequest,
    rejectRequest,
    changeUserRole,
  };
}
