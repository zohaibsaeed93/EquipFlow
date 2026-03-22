import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { useDeleteSlot } from "../hooks/useScheduling";
import toast from "react-hot-toast";
import type { AvailabilitySlot } from "../types/scheduling.types";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Modal } from "./ui/Modal";

interface AvailabilityListProps {
  slots: AvailabilitySlot[];
  isLoading: boolean;
  equipmentMap?: Record<string, string>;
}

const SkeletonCard: React.FC = () => (
  <div
    className="rounded-2xl border p-5"
    style={{
      borderColor: "var(--card-border)",
      backgroundColor: "var(--card-bg)",
    }}
  >
    <div className="skeleton h-4 w-1/2 mb-3" />
    <div className="skeleton h-3 w-3/4 mb-2" />
    <div className="skeleton h-3 w-1/3" />
  </div>
);

export const AvailabilityList: React.FC<AvailabilityListProps> = ({
  slots,
  isLoading,
  equipmentMap,
}) => {
  const deleteSlot = useDeleteSlot();
  const [slotToDelete, setSlotToDelete] = useState<AvailabilitySlot | null>(
    null,
  );

  const sortedSlots = useMemo(
    () =>
      [...slots].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      ),
    [slots],
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteSlot.mutateAsync(id);
      toast.success("Slot deleted");
      setSlotToDelete(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to delete slot");
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center py-16">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: "var(--accent-muted)" }}
        >
          <svg
            className="w-7 h-7"
            style={{ color: "var(--accent)" }}
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
        <p
          className="text-base font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          No availability slots yet
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
          Create your first slot to start accepting bookings
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedSlots.map((slot) => (
          <Card
            key={slot.id}
            className="p-5 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: slot.isBooked
                      ? "var(--success)"
                      : "var(--info)",
                  }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {format(new Date(slot.startTime), "EEEE, MMM d")}
                </span>
              </div>
              <Badge variant={slot.isBooked ? "success" : "info"}>
                {slot.isBooked ? "Booked" : "Available"}
              </Badge>
            </div>
            <p
              className="text-sm mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {format(new Date(slot.startTime), "PPP")}
            </p>
            <p className="text-sm mb-1" style={{ color: "var(--text-tertiary)" }}>
              Equipment:{" "}
              <span style={{ color: "var(--text-secondary)" }}>
                {slot.equipment?.name ||
                  (slot.equipmentId
                    ? equipmentMap?.[slot.equipmentId]
                    : "Unassigned")}
              </span>
            </p>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {format(new Date(slot.startTime), "h:mm a")} –{" "}
              {format(new Date(slot.endTime), "h:mm a")}
            </p>
            {!slot.isBooked && (
              <Button
                onClick={() => setSlotToDelete(slot)}
                variant="danger"
                className="mt-4 px-3 py-1.5 text-xs"
              >
                Delete
              </Button>
            )}
          </Card>
        ))}
      </div>

      <Modal
        isOpen={!!slotToDelete}
        onClose={() => setSlotToDelete(null)}
        className="max-w-md"
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--danger-muted)" }}
          >
            <svg
              className="w-5 h-5"
              style={{ color: "var(--danger)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </div>
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Delete slot?
            </h3>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              {slotToDelete
                ? `${format(new Date(slotToDelete.startTime), "PPP p")} to ${format(new Date(slotToDelete.endTime), "p")}`
                : "selected time"}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setSlotToDelete(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            isLoading={deleteSlot.isPending}
            onClick={() => slotToDelete && handleDelete(slotToDelete.id)}
          >
            {deleteSlot.isPending ? "Deleting..." : "Delete Slot"}
          </Button>
        </div>
      </Modal>
    </>
  );
};
