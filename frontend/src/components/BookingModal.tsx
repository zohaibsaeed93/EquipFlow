import React from "react";
import { useCreateBooking } from "../hooks/useScheduling";
import { format } from "date-fns";
import toast from "react-hot-toast";
import type { AvailabilitySlot } from "../types/scheduling.types";

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

  if (!isOpen || !slot) return null;

  const handleConfirm = async () => {
    try {
      await createBooking.mutateAsync({ slotId: slot.id });
      toast.success("Slot booked successfully!");
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to book slot");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-emerald-600"
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
              <h2 className="text-lg font-semibold text-gray-900">
                Confirm Booking
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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

          <div className="bg-gray-50/80 rounded-xl p-4 mb-6 space-y-3 border border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Host</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white">
                    {(slot.user?.name || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {slot.user?.name || "Unknown"}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Date</span>
              <span className="text-sm font-medium text-gray-900">
                {format(new Date(slot.startTime), "EEEE, MMM d, yyyy")}
              </span>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Time</span>
              <span className="text-sm font-medium text-gray-900">
                {format(new Date(slot.startTime), "h:mm a")} –{" "}
                {format(new Date(slot.endTime), "h:mm a")}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={createBooking.isPending}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all duration-200 shadow-sm shadow-emerald-200"
            >
              {createBooking.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Booking...
                </span>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
