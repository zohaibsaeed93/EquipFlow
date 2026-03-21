import React from "react";
import { format } from "date-fns";
import { useCancelBooking } from "../hooks/useScheduling";
import toast from "react-hot-toast";
import type { Booking } from "../types/scheduling.types";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

interface BookingsTableProps {
  bookings: Booking[];
  isLoading: boolean;
  equipmentMap?: Record<string, string>;
}

const SkeletonRow: React.FC = () => (
  <tr>
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="skeleton h-4 w-3/4" />
      </td>
    ))}
  </tr>
);

export const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  isLoading,
  equipmentMap,
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
    <div
      className="overflow-x-auto rounded-2xl border"
      style={{
        borderColor: "var(--card-border)",
        backgroundColor: "var(--card-bg)",
        boxShadow: "0 4px 16px var(--card-shadow)",
      }}
    >
      <table className="min-w-full divide-y" style={{ borderColor: "var(--divider)" }}>
        <thead>
          <tr style={{ backgroundColor: "var(--bg-secondary)" }}>
            <th
              className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Host
            </th>
            <th
              className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Equipment
            </th>
            <th
              className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Date
            </th>
            <th
              className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Time
            </th>
            <th
              className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Status
            </th>
            <th
              className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
          ) : bookings.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                    style={{ backgroundColor: "var(--accent-muted)" }}
                  >
                    <svg
                      className="w-6 h-6"
                      style={{ color: "var(--accent)" }}
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
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    No bookings found
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Your booked slots will appear here
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            bookings.map((booking, index) => (
              <tr
                key={booking.id}
                className="transition-colors duration-150"
                style={{
                  backgroundColor:
                    index % 2 === 1 ? "var(--bg-secondary)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--accent-muted)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    index % 2 === 1 ? "var(--bg-secondary)" : "transparent";
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                      <span className="text-[11px] font-bold text-white">
                        {(booking.slot?.user?.name || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {booking.slot?.user?.name || "—"}
                      </div>
                      <div
                        className="text-[11px]"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        @{booking.slot?.user?.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {booking.slot?.equipment?.name ||
                    (booking.slot?.equipmentId
                      ? equipmentMap?.[booking.slot.equipmentId]
                      : "—")}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {booking.slot
                    ? format(new Date(booking.slot.startTime), "MMM d, yyyy")
                    : "—"}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {booking.slot
                    ? `${format(new Date(booking.slot.startTime), "h:mm a")} – ${format(new Date(booking.slot.endTime), "h:mm a")}`
                    : "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={booking.status === "booked" ? "success" : "danger"}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          booking.status === "booked"
                            ? "var(--success)"
                            : "var(--danger)",
                      }}
                    />
                    {booking.status === "booked" ? "Booked" : "Cancelled"}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {booking.status === "booked" && (
                    <Button
                      onClick={() => handleCancel(booking.id)}
                      variant="danger"
                      isLoading={cancelBooking.isPending}
                      className="px-3 py-1.5 text-xs"
                    >
                      Cancel
                    </Button>
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
