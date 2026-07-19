import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  deleteClub as requestDeleteClub,
  getClubMembers,
  leaveClub as requestLeaveClub,
  transferClubOwnership,
} from "@/lib/clubs";
import type { ClubMemberSummary } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";

type OwnerLeaveStep = "choice" | "transfer";

type OwnerLeaveDialogProps = {
  isOpen: boolean;
  clubId: string;
  onClose: () => void;
  onCompleted: () => void;
};

export default function OwnerLeaveDialog({
  isOpen,
  clubId,
  onClose,
  onCompleted,
}: OwnerLeaveDialogProps) {
  const [step, setStep] = useState<OwnerLeaveStep>("choice");
  const [members, setMembers] = useState<ClubMemberSummary[]>([]);
  const [selectedNextOwnerId, setSelectedNextOwnerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep("choice");
      setMembers([]);
      setSelectedNextOwnerId("");
      setIsLoading(false);
    }
  }, [isOpen]);

  const candidates = useMemo(
    () => members.filter((member) => member.role !== "OWNER"),
    [members],
  );

  const loadTransferCandidates = async () => {
    try {
      setIsLoading(true);
      const result = await getClubMembers(clubId);
      setMembers(result);
      setStep("transfer");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to load members",
        description: err instanceof Error ? err.message : "Failed to load members",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClub = async () => {
    try {
      setIsLoading(true);
      await requestDeleteClub(clubId);
      toast({
        title: "Club deleted",
        description: "The club has been removed.",
      });
      onCompleted();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to delete club",
        description: err instanceof Error ? err.message : "Failed to delete club",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferAndLeave = async () => {
    if (!selectedNextOwnerId) {
      toast({
        variant: "destructive",
        title: "Select a new owner",
        description: "Please select a member or moderator to become owner.",
      });
      return;
    }

    try {
      setIsLoading(true);
      await transferClubOwnership(clubId, selectedNextOwnerId);
      await requestLeaveClub(clubId);
      toast({
        title: "Ownership transferred",
        description: "You left the club after handing off ownership.",
      });
      onCompleted();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to transfer ownership",
        description:
          err instanceof Error ? err.message : "Failed to transfer ownership",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="app-modal-backdrop">
      <div className="app-modal-panel max-w-xl p-4 sm:p-6">
        <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="break-words font-serif text-2xl text-[var(--app-text-primary)]">
              Leave As Club Owner
            </h2>
            <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
              Owners must either delete the club or transfer ownership before
              leaving.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="shrink-0 rounded-lg border border-[var(--app-border-subtle)] p-1.5 text-[var(--app-text-secondary)] transition hover:border-[var(--app-border-strong)] hover:text-[var(--app-text-primary)]"
            aria-label="Close owner leave dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "choice" ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => void handleDeleteClub()}
              disabled={isLoading}
              className="w-full rounded border border-red-500/40 bg-red-500/15 px-4 py-3 text-left text-sm font-semibold text-red-300 transition hover:bg-red-500/25 disabled:opacity-60"
            >
              Delete Club Completely
            </button>

            <button
              type="button"
              onClick={() => void loadTransferCandidates()}
              disabled={isLoading}
              className="app-choice-row w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[var(--app-text-primary)] transition hover:border-[var(--app-border-strong)] disabled:opacity-60"
            >
              Transfer Ownership To Another Member
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[var(--app-text-secondary)]">
              Select a member or moderator to become the new owner.
            </p>

            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-[var(--app-border-subtle)] bg-[rgba(8,11,10,0.42)] p-2">
              {candidates.length === 0 ? (
                <p className="px-2 py-1 text-sm text-[var(--app-text-secondary)]">
                  No eligible member found. Invite members first.
                </p>
              ) : (
                candidates.map((member) => (
                  <button
                    key={member.userId}
                    type="button"
                    onClick={() => setSelectedNextOwnerId(member.userId)}
                    className={`w-full rounded px-3 py-2 text-left transition ${
                      selectedNextOwnerId === member.userId
                        ? "border border-[var(--app-accent-gold)] bg-[var(--app-accent-teal-soft)]"
                        : "border border-transparent bg-[rgba(244,234,216,0.045)] hover:bg-[rgba(244,234,216,0.07)]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[var(--app-text-primary)]">
                      {member.username}
                    </p>
                    <p className="break-all text-xs text-[var(--app-text-muted)]">{member.email}</p>
                    <p className="text-[11px] uppercase tracking-wide text-[var(--app-accent-gold)]">
                      {member.role}
                    </p>
                  </button>
                ))
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => setStep("choice")}
                disabled={isLoading}
                className="app-button-secondary w-full disabled:opacity-60 sm:w-auto"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => void handleTransferAndLeave()}
                disabled={isLoading || !selectedNextOwnerId}
                className="app-button-primary w-full disabled:opacity-60 sm:w-auto"
              >
                {isLoading ? "Transferring..." : "Transfer and Leave"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
