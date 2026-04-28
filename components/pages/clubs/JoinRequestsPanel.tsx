import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import type { JoinRequest } from "@/hooks/useClubModeration";

interface JoinRequestsPanelProps {
  clubId: string;
  requests: JoinRequest[];
  loading: boolean;
  actionInProgress: string | null;
  onApprove: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function JoinRequestsPanel({
  clubId,
  requests,
  loading,
  actionInProgress,
  onApprove,
  onReject,
  onRefresh,
}: JoinRequestsPanelProps) {
  useEffect(() => {
    // Load requests on mount
    void onRefresh();
  }, [clubId]);

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const reviewedRequests = requests.filter((r) => r.status !== "PENDING");

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1 }}
      className="rounded-2xl border border-[#C9A96E]/25 bg-[#2A1810]/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] md:p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-[#F2E8D9]">Join Requests</h2>
        <button
          onClick={() => void onRefresh()}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded bg-[#C9A96E]/20 text-[#C9A96E] hover:bg-[#C9A96E]/30 transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {pendingRequests.length === 0 && reviewedRequests.length === 0 ? (
        <p className="text-[#F2E8D9]/60 text-sm">No join requests yet.</p>
      ) : (
        <div className="space-y-4">
          {pendingRequests.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#C9A96E] uppercase tracking-wide mb-3">
                Pending ({pendingRequests.length})
              </h3>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between gap-4 rounded-lg border border-[#C9A96E]/20 bg-[#1A0F07]/50 p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#F2E8D9] truncate">
                        {request.username}
                      </p>
                      <p className="text-xs text-[#F2E8D9]/60 truncate">
                        {request.email}
                      </p>
                      <p className="text-xs text-[#C9A96E]/60 mt-1">
                        Requested {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => void onApprove(request.id)}
                        disabled={actionInProgress === request.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition disabled:opacity-50 text-xs font-medium"
                      >
                        {actionInProgress === request.id ? (
                          <span className="inline-block animate-spin">⟳</span>
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        {actionInProgress === request.id ? "..." : "Approve"}
                      </button>
                      <button
                        onClick={() => void onReject(request.id)}
                        disabled={actionInProgress === request.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 transition disabled:opacity-50 text-xs font-medium"
                      >
                        {actionInProgress === request.id ? (
                          <span className="inline-block animate-spin">⟳</span>
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {actionInProgress === request.id ? "..." : "Reject"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {reviewedRequests.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#C9A96E]/60 uppercase tracking-wide mb-3">
                Reviewed ({reviewedRequests.length})
              </h3>
              <div className="space-y-3">
                {reviewedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-[#C9A96E]/10 bg-[#1A0F07]/30 p-4 opacity-70"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#F2E8D9] truncate">
                        {request.username}
                      </p>
                      <p className="text-xs text-[#F2E8D9]/60 truncate">
                        {request.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {request.status === "APPROVED" ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          <span className="text-xs text-emerald-400">Approved</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-xs text-red-400">Rejected</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
