import React from "react";
import { useCreateBooking } from "../hooks/useScheduling";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import type { AvailabilitySlot } from "../types/scheduling.types";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: AvailabilitySlot | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  slot,
}) => {
  const createBooking = useCreateBooking();
  const qc = useQueryClient();
  const [bookingError, setBookingError] = React.useState<string>("");

  React.useEffect(() => {
    if (isOpen) {
      setBookingError("");
    }
  }, [isOpen]);

  if (!isOpen || !slot) return null;

  const handleConfirm = async () => {
    setBookingError("");
    createBooking.mutate(
      {
        slotId: slot.id,
      },
      {
        onSuccess: async () => {
          await qc.invalidateQueries({ queryKey: ["bookings"] });
          await qc.invalidateQueries({ queryKey: ["slots"] });
          toast.success("Slot booked successfully!");
          onClose();
        },
        onError: (err: unknown) => {
          const error = err as {
            response?: {
              status?: number;
              data?: { error?: string };
            };
          };
          const message = error.response?.data?.error || "Failed to book slot";

          if (error.response?.status === 409) {
            toast.error("Slot unavailable");
          } else {
            toast.error(message);
          }

          setBookingError(message);
        },
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--success-muted)" }}
          >
            <svg
              className="w-5 h-5"
              style={{ color: "var(--success)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Confirm Booking
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-tertiary)";
          }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Booking details */}
      <div
        className="mb-6 space-y-3 rounded-xl border p-4"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Host
          </span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
              <span className="text-[9px] font-bold text-white">
                {(slot.user?.name || "?").charAt(0).toUpperCase()}
              </span>
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {slot.user?.name || "Unknown"}
            </span>
          </div>
        </div>

        <div className="border-t" style={{ borderColor: "var(--divider)" }} />

        <div className="flex justify-between">
          <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Date
          </span>
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {format(new Date(slot.startTime), "EEEE, MMM d, yyyy")}
          </span>
        </div>

        <div className="border-t" style={{ borderColor: "var(--divider)" }} />

        <div className="flex justify-between">
          <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Time
          </span>
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {format(new Date(slot.startTime), "h:mm a")} –{" "}
            {format(new Date(slot.endTime), "h:mm a")}
          </span>
        </div>

        <div className="border-t" style={{ borderColor: "var(--divider)" }} />

        <div className="flex justify-between">
          <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Equipment
          </span>
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {slot.equipment?.name || "-"}
          </span>
        </div>
      </div>

      {/* Error message */}
      {bookingError && (
        <div
          className="mb-4 rounded-xl border px-4 py-3 text-sm flex items-center gap-2"
          style={{
            borderColor: "var(--danger-muted)",
            backgroundColor: "var(--danger-muted)",
            color: "var(--danger)",
          }}
        >
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          {bookingError}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={onClose}
          variant="secondary"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          isLoading={createBooking.isPending}
          disabled={slot.isBooked}
          className="flex-1"
        >
          {createBooking.isPending ? "Booking..." : "Confirm Booking"}
        </Button>
      </div>
    </Modal>
  );
};
