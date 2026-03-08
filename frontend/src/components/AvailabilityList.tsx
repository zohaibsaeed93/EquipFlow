import React from "react";
import { format } from "date-fns";
import { useDeleteSlot } from "../hooks/useScheduling";
import toast from "react-hot-toast";
import type { AvailabilitySlot } from "../types/scheduling.types";

interface AvailabilityListProps {
  slots: AvailabilitySlot[];
  isLoading: boolean;
}

const SkeletonCard: React.FC = () => (
  <div className="animate-pulse bg-white rounded-2xl border border-gray-100 p-5">
    <div className="h-4 bg-gray-100 rounded-md w-1/2 mb-3" />
    <div className="h-3 bg-gray-50 rounded-md w-3/4 mb-2" />
    <div className="h-3 bg-gray-50 rounded-md w-1/3" />
  </div>
);

export const AvailabilityList: React.FC<AvailabilityListProps> = ({
  slots,
  isLoading,
}) => {
  const deleteSlot = useDeleteSlot();

  const handleDelete = async (id: string) => {
    try {
      await deleteSlot.mutateAsync(id);
      toast.success("Slot deleted");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to delete slot");
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center py-16">
        <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-7 h-7 text-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-base font-medium text-gray-700">
          No availability slots yet
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Create your first slot to start accepting bookings
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {slots.map((slot) => (
        <div
          key={slot.id}
          className={`bg-white rounded-2xl border p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
            slot.isBooked
              ? "border-emerald-100 bg-emerald-50/20"
              : "border-gray-100"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  slot.isBooked ? "bg-emerald-500" : "bg-sky-500"
                }`}
              />
              <span className="text-sm font-semibold text-gray-900">
                {format(new Date(slot.startTime), "EEEE, MMM d")}
              </span>
            </div>
            <span
              className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                slot.isBooked
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10"
                  : "bg-sky-50 text-sky-700 ring-1 ring-sky-600/10"
              }`}
            >
              {slot.isBooked ? "Booked" : "Available"}
            </span>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            {format(new Date(slot.startTime), "h:mm a")} –{" "}
            {format(new Date(slot.endTime), "h:mm a")}
          </p>
          {!slot.isBooked && (
            <button
              onClick={() => handleDelete(slot.id)}
              disabled={deleteSlot.isPending}
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
