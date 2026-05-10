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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-[#C9A96E]/35 bg-[#2A1810] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl text-[#F2E8D9]">
              Leave As Club Owner
            </h2>
            <p className="mt-1 text-sm text-[#F2E8D9]/70">
              Owners must either delete the club or transfer ownership before
              leaving.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded p-1 text-[#F2E8D9]/70 transition hover:bg-[#1A0F07]/70 hover:text-[#F2E8D9]"
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
              className="w-full rounded border border-[#C9A96E]/40 bg-[#C9A96E]/15 px-4 py-3 text-left text-sm font-semibold text-[#F2E8D9] transition hover:bg-[#C9A96E]/25 disabled:opacity-60"
            >
              Transfer Ownership To Another Member
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[#F2E8D9]/80">
              Select a member or moderator to become the new owner.
            </p>

            <div className="max-h-64 space-y-2 overflow-y-auto rounded border border-[#C9A96E]/25 bg-[#1A0F07]/40 p-2">
              {candidates.length === 0 ? (
                <p className="px-2 py-1 text-sm text-[#F2E8D9]/65">
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
                        ? "border border-[#C9A96E] bg-[#C9A96E]/20"
                        : "border border-transparent bg-[#2A1810]/60 hover:bg-[#2A1810]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#F2E8D9]">
                      {member.username}
                    </p>
                    <p className="text-xs text-[#F2E8D9]/65">{member.email}</p>
                    <p className="text-[11px] uppercase tracking-wide text-[#C9A96E]/90">
                      {member.role}
                    </p>
                  </button>
                ))
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setStep("choice")}
                disabled={isLoading}
                className="rounded border border-[#C9A96E]/35 px-4 py-2 text-sm text-[#F2E8D9] transition hover:bg-[#C9A96E]/15 disabled:opacity-60"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => void handleTransferAndLeave()}
                disabled={isLoading || !selectedNextOwnerId}
                className="rounded bg-[#C9A96E] px-4 py-2 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884] disabled:opacity-60"
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
