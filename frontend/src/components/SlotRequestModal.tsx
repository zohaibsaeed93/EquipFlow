import React from "react";
import { useApproveSlotRequest, useRejectSlotRequest } from "../hooks/useScheduling";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import type { SlotRequest } from "../types/scheduling.types";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface SlotRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: SlotRequest | null;
}

export const SlotRequestModal: React.FC<SlotRequestModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  const approveRequest = useApproveSlotRequest();
  const rejectRequest = useRejectSlotRequest();

  if (!isOpen || !request) return null;

  const handleApprove = async () => {
    try {
      await approveRequest.mutateAsync(request.id);
      toast.success("Request approved — slot created!");
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to approve request");
    }
  };

  const handleReject = async () => {
    try {
      await rejectRequest.mutateAsync(request.id);
      toast.success("Request rejected");
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to reject request");
    }
  };

  const isPending = approveRequest.isPending || rejectRequest.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#fef3c7" }}
          >
            <svg
              className="w-5 h-5"
              style={{ color: "#92400e" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Slot Request
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Request details */}
      <div className="space-y-3 mb-6">
        <div
          className="rounded-xl border p-4"
          style={{
            borderColor: "var(--card-border)",
            backgroundColor: "var(--bg-secondary)",
          }}
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                Requested By
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {request.requestedByUser?.name || "Unknown"}
              </span>
            </div>

            <div
              className="border-t"
              style={{ borderColor: "var(--divider)" }}
            />

            <div className="flex items-center justify-between">
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                Start Time
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {format(new Date(request.startTime), "MMM d, yyyy · h:mm a")}
              </span>
            </div>

            <div
              className="border-t"
              style={{ borderColor: "var(--divider)" }}
            />

            <div className="flex items-center justify-between">
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                End Time
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {format(new Date(request.endTime), "MMM d, yyyy · h:mm a")}
              </span>
            </div>

            {request.equipment && (
              <>
                <div
                  className="border-t"
                  style={{ borderColor: "var(--divider)" }}
                />
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Equipment
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {request.equipment.name}
                  </span>
                </div>
              </>
            )}

            <div
              className="border-t"
              style={{ borderColor: "var(--divider)" }}
            />

            <div className="flex items-center justify-between">
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                Status
              </span>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: "#fef3c7",
                  color: "#92400e",
                }}
              >
                ● Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={handleReject}
          variant="secondary"
          className="flex-1"
          isLoading={rejectRequest.isPending}
          disabled={isPending}
        >
          <span style={{ color: "var(--danger)" }}>✕</span>{" "}
          {rejectRequest.isPending ? "Rejecting..." : "Reject"}
        </Button>
        <Button
          type="button"
          onClick={handleApprove}
          className="flex-1"
          isLoading={approveRequest.isPending}
          disabled={isPending}
        >
          {approveRequest.isPending ? "Approving..." : "✓ Approve"}
        </Button>
      </div>
    </Modal>
  );
};
