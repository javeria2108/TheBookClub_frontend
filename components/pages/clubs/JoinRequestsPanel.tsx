import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import type { JoinRequest } from "@/hooks/useClubModeration";

interface JoinRequestsPanelProps {
  requests: JoinRequest[];
  loading: boolean;
  actionInProgress: string | null;
  onApprove: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function JoinRequestsPanel({
  requests,
  loading,
  actionInProgress,
  onApprove,
  onReject,
  onRefresh,
}: JoinRequestsPanelProps) {
  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const reviewedRequests = requests.filter((r) => r.status !== "PENDING");

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1 }}
      className="app-surface-elevated min-w-0 rounded-2xl p-4 sm:p-6 md:p-8"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="break-words font-serif text-2xl text-[var(--app-text-primary)]">Join Requests</h2>
        <button
          onClick={() => void onRefresh()}
          disabled={loading}
          className="rounded-lg px-3 py-2 text-xs text-[var(--app-accent-gold)] transition hover:bg-[rgba(216,181,109,0.08)] disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {pendingRequests.length === 0 && reviewedRequests.length === 0 ? (
        <p className="text-sm text-[var(--app-text-secondary)]">No join requests yet.</p>
      ) : (
        <div className="space-y-4">
          {pendingRequests.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--app-accent-gold)]">
                Pending ({pendingRequests.length})
              </h3>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="app-choice-row flex min-w-0 flex-col gap-4 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-semibold text-[var(--app-text-primary)]">
                        {request.username}
                      </p>
                      <p className="truncate text-xs text-[var(--app-text-muted)]">
                        {request.email}
                      </p>
                      <p className="mt-1 text-xs text-[var(--app-accent-gold)]">
                        Requested {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex w-full flex-shrink-0 gap-2 sm:w-auto">
                      <button
                        onClick={() => void onApprove(request.id)}
                        disabled={actionInProgress === request.id}
                        className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded bg-emerald-600/20 px-3 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-600/30 disabled:opacity-50 sm:flex-none"
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
                        className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded bg-red-600/20 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-600/30 disabled:opacity-50 sm:flex-none"
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
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
                Reviewed ({reviewedRequests.length})
              </h3>
              <div className="space-y-3">
                {reviewedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="app-choice-row flex min-w-0 flex-col gap-3 rounded-lg p-4 opacity-70 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-semibold text-[var(--app-text-primary)]">
                        {request.username}
                      </p>
                      <p className="truncate text-xs text-[var(--app-text-muted)]">
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
