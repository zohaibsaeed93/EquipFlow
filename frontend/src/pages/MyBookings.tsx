import React from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Navbar } from "../components/Navbar";
import { BookingsTable } from "../components/BookingsTable";
import {
  useAllSlots,
  useBookings,
  useDeleteSlot,
  useEquipment,
} from "../hooks/useScheduling";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";

export const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data: bookings = [], isLoading } = useBookings();
  const { data: allSlots = [], isLoading: isSlotsLoading } = useAllSlots();
  const { data: equipment = [] } = useEquipment();
  const deleteSlot = useDeleteSlot();

  console.log("MyBookings - bookings:", bookings);

  const handleDeleteSlot = async (slotId: string, isBooked: boolean) => {
    if (isBooked) {
      return;
    }

    const confirmed = window.confirm("Delete this slot?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteSlot.mutateAsync(slotId);
      toast.success("Slot deleted");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to delete slot");
    }
  };

  const equipmentMap = React.useMemo(
    () =>
      equipment.reduce<Record<string, string>>((acc, item) => {
        acc[item.id] = item.name;
        return acc;
      }, {}),
    [equipment],
  );

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <Navbar />
      <div className="w-full max-w-[1400px] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {isAdmin ? "All Slots" : "My Bookings"}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>
            {isAdmin
              ? "View all availability slots"
              : "View and manage your scheduled equipment bookings"}
          </p>
        </div>

        {isAdmin ? (
          <div
            className="overflow-x-auto rounded-2xl border"
            style={{
              borderColor: "var(--card-border)",
              backgroundColor: "var(--card-bg)",
              boxShadow: "0 4px 16px var(--card-shadow)",
            }}
          >
            <table
              className="min-w-full divide-y"
              style={{ borderColor: "var(--divider)" }}
            >
              <thead>
                <tr style={{ backgroundColor: "var(--bg-secondary)" }}>
                  <th
                    className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Start Time
                  </th>
                  <th
                    className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    End Time
                  </th>
                  <th
                    className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Status
                  </th>
                  <th
                    className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Equipment
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
                {isSlotsLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Loading slots...
                    </td>
                  </tr>
                ) : allSlots.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      No slots found
                    </td>
                  </tr>
                ) : (
                  allSlots.map((slot, index) => (
                    <tr
                      key={slot.id}
                      style={{
                        backgroundColor:
                          index % 2 === 1
                            ? "var(--bg-secondary)"
                            : "transparent",
                      }}
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {format(new Date(slot.startTime), "MMM d, yyyy h:mm a")}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {format(new Date(slot.endTime), "MMM d, yyyy h:mm a")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={slot.isBooked ? "danger" : "success"}>
                          {slot.isBooked ? "Booked" : "Available"}
                        </Badge>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {slot.equipment?.name ||
                          (slot.equipmentId
                            ? equipmentMap[slot.equipmentId]
                            : "No equipment")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          variant="danger"
                          className="px-3 py-1.5 text-xs"
                          disabled={slot.isBooked}
                          isLoading={deleteSlot.isPending}
                          onClick={() => handleDeleteSlot(slot.id, slot.isBooked)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <BookingsTable
            bookings={bookings}
            isLoading={isLoading}
            equipmentMap={equipmentMap}
          />
        )}
      </div>
    </div>
  );
};
