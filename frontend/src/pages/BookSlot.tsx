import React, { useState } from "react";
import { Navbar } from "../components/Navbar";
import { SlotCalendar } from "../components/SlotCalendar";
import { BookingModal } from "../components/BookingModal";
import { CreateSlotModal } from "../components/CreateSlotModal";
import {
  useAvailableSlots,
  useAllSlots,
  useEquipment,
  useUserCertifications,
} from "../hooks/useScheduling";
import type { AvailabilitySlot, Equipment } from "../types/scheduling.types";
import { useAuth } from "../hooks/useAuth";
import { Badge } from "../components/ui/Badge";
import toast from "react-hot-toast";

export const BookSlot: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data: availableSlots = [], isLoading: isAvailableSlotsLoading } =
    useAvailableSlots();
  const { data: allSlots = [], isLoading: isAllSlotsLoading } = useAllSlots();
  const slots = isAdmin ? allSlots : availableSlots;
  const isLoading = isAdmin ? isAllSlotsLoading : isAvailableSlotsLoading;
  const { data: equipment = [] } = useEquipment();
  const { data: userCertifications = [] } = useUserCertifications(
    user?.id || "",
  );
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null,
  );
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createDefaultDate, setCreateDefaultDate] = useState<Date | undefined>(
    undefined,
  );
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );

  const equipmentMap = React.useMemo(
    () =>
      equipment.reduce<Record<string, string>>((acc, item) => {
        acc[item.id] = item.name;
        return acc;
      }, {}),
    [equipment],
  );

  const userCertIds = new Set(userCertifications.map((c) => c.id));

  const filteredSlots = React.useMemo(() => {
    if (isAdmin) {
      return slots;
    }
    if (!selectedEquipment) {
      return slots;
    }
    return slots.filter((slot) => slot.equipmentId === selectedEquipment.id);
  }, [slots, selectedEquipment, isAdmin]);

  const handleSlotClick = (slot: AvailabilitySlot) => {
    if (isAdmin) return;

    if (slot.isBooked) {
      toast.error("Slot already booked");
      return;
    }

    setSelectedSlot(slot);
    setBookingModalOpen(true);
  };

  const handleEmptyClick = (date: Date) => {
    if (!isAdmin) {
      return;
    }
    setCreateDefaultDate(date);
    setCreateModalOpen(true);
  };

  const handleEquipmentSelect = (item: Equipment) => {
    setSelectedEquipment((prev) => (prev?.id === item.id ? null : item));
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <Navbar />
      <div className="w-full max-w-[1400px] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {isAdmin ? "Create Slot" : "Book Equipment"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
            {isAdmin
              ? "Create and manage equipment availability slots"
              : "Select equipment, review certifications, and pick a time slot"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Equipment cards */}
          {!isAdmin && (
            <div className="lg:col-span-4 space-y-3">
              <h2
                className="text-sm font-semibold uppercase tracking-wider mb-3"
                style={{ color: "var(--text-tertiary)" }}
              >
                Equipment ({equipment.length})
              </h2>

              {equipment.length === 0 ? (
                <div
                  className="rounded-2xl border p-8 flex flex-col items-center"
                  style={{
                    borderColor: "var(--card-border)",
                    backgroundColor: "var(--card-bg)",
                  }}
                >
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
                        d="M11.42 15.17l-5.66-5.66a8 8 0 1111.32 0l-5.66 5.66z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.42 15.17L7.75 21h8.34l-3.67-5.83z"
                      />
                    </svg>
                  </div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    No equipment available
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Admin needs to add equipment first
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                  {equipment.map((item) => {
                    const isSelected = selectedEquipment?.id === item.id;
                    const requirements = item.requirements || [];
                    const missingCerts = requirements
                      .map((r) => r.certification)
                      .filter(Boolean)
                      .filter((cert) => !userCertIds.has(cert!.id));
                    const hasDeps =
                      item.dependencies && item.dependencies.length > 0;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleEquipmentSelect(item)}
                        className="w-full text-left rounded-xl border p-4 transition-all duration-200"
                        style={{
                          borderColor: isSelected
                            ? "var(--accent)"
                            : "var(--card-border)",
                          backgroundColor: isSelected
                            ? "var(--accent-muted)"
                            : "var(--card-bg)",
                          boxShadow: isSelected
                            ? "0 0 0 1px var(--accent), 0 4px 12px var(--accent-glow)"
                            : "0 2px 8px var(--card-shadow)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3
                            className="text-sm font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {item.name}
                          </h3>
                          {missingCerts.length === 0 ? (
                            <Badge variant="success" className="text-[10px]">
                              ✓ Ready
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="text-[10px]">
                              {missingCerts.length} cert missing
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {requirements.length > 0 ? (
                            requirements.map((req) => (
                              <span
                                key={req.id}
                                className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                                style={{
                                  backgroundColor: userCertIds.has(
                                    req.certification?.id || "",
                                  )
                                    ? "var(--success-muted)"
                                    : "var(--danger-muted)",
                                  color: userCertIds.has(
                                    req.certification?.id || "",
                                  )
                                    ? "var(--success)"
                                    : "var(--danger)",
                                }}
                              >
                                {userCertIds.has(req.certification?.id || "")
                                  ? "✓"
                                  : "✕"}{" "}
                                {req.certification?.name || "Cert"}
                              </span>
                            ))
                          ) : (
                            <span
                              className="text-[10px]"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              No certifications required
                            </span>
                          )}
                        </div>

                        {hasDeps && (
                          <div className="mt-2 flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              style={{ color: "var(--info)" }}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.008a4.5 4.5 0 00-6.364-6.364L4.758 8.25l4.5 4.5a4.5 4.5 0 007.244 1.242"
                              />
                            </svg>
                            <span
                              className="text-[10px]"
                              style={{ color: "var(--info)" }}
                            >
                              {item.dependencies!.length} dependenc
                              {item.dependencies!.length > 1 ? "ies" : "y"}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Right: Calendar */}
          <div className={isAdmin ? "lg:col-span-12" : "lg:col-span-8"}>
            {selectedEquipment && !isAdmin && (
              <div
                className="mb-4 rounded-lg border px-4 py-3 flex items-center justify-between"
                style={{
                  borderColor: "var(--accent)",
                  backgroundColor: "var(--accent-muted)",
                }}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    style={{ color: "var(--accent)" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--accent)" }}
                  >
                    Filtered: {selectedEquipment.name}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEquipment(null)}
                  className="text-xs font-medium px-2 py-1 rounded-md transition-colors"
                  style={{
                    color: "var(--accent)",
                    backgroundColor: "var(--card-bg)",
                  }}
                >
                  Clear
                </button>
              </div>
            )}

            <SlotCalendar
              slots={filteredSlots}
              isLoading={isLoading}
              onSlotClick={handleSlotClick}
              onEmptyClick={isAdmin ? handleEmptyClick : undefined}
              equipmentMap={equipmentMap}
            />
          </div>
        </div>

        {!isAdmin && (
          <BookingModal
            isOpen={bookingModalOpen}
            onClose={() => setBookingModalOpen(false)}
            slot={selectedSlot}
          />
        )}

        {isAdmin && (
          <CreateSlotModal
            isOpen={createModalOpen}
            onClose={() => {
              setCreateModalOpen(false);
              setCreateDefaultDate(undefined);
            }}
            defaultDate={createDefaultDate}
            equipmentOptions={equipment}
          />
        )}
      </div>
    </div>
  );
};
