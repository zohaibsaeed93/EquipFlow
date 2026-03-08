import React from "react";
import { format } from "date-fns";
import { useCancelBooking } from "../hooks/useScheduling";
import toast from "react-hot-toast";
import type { Booking } from "../types/scheduling.types";

interface BookingsTableProps {
  bookings: Booking[];
  isLoading: boolean;
}

const SkeletonRow: React.FC = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 5 }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-gray-100 rounded-md w-3/4" />
      </td>
    ))}
  </tr>
);

export const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  isLoading,
}) => {
  const cancelBooking = useCancelBooking();

  const handleCancel = async (bookingId: string) => {
    try {
      await cancelBooking.mutateAsync(bookingId);
      toast.success("Booking cancelled");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to cancel booking");
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
      <table className="min-w-full divide-y divide-gray-100">
        <thead>
          <tr className="bg-gray-50/70">
            <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Host
            </th>
            <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Time
            </th>
            <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3.5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
          ) : bookings.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    No bookings found
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Your booked slots will appear here
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            bookings.map((booking, index) => (
              <tr
                key={booking.id}
                className={`transition-colors duration-150 hover:bg-indigo-50/30 ${
                  index % 2 === 1 ? "bg-gray-50/40" : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center">
                      <span className="text-[11px] font-bold text-white">
                        {(booking.slot?.user?.name || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.slot?.user?.name || "—"}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        @{booking.slot?.user?.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {booking.slot
                    ? format(new Date(booking.slot.startTime), "MMM d, yyyy")
                    : "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                  {booking.slot
                    ? `${format(new Date(booking.slot.startTime), "h:mm a")} – ${format(new Date(booking.slot.endTime), "h:mm a")}`
                    : "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full ${
                      booking.status === "booked"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10"
                        : "bg-gray-100 text-gray-500 ring-1 ring-gray-500/10"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        booking.status === "booked"
                          ? "bg-emerald-500"
                          : "bg-gray-400"
                      }`}
                    />
                    {booking.status === "booked" ? "Booked" : "Cancelled"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {booking.status === "booked" && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancelBooking.isPending}
                      className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
