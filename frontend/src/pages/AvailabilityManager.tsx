import React, { useState } from "react";
import { Navbar } from "../components/Navbar";
import { AvailabilityList } from "../components/AvailabilityList";
import { CreateSlotModal } from "../components/CreateSlotModal";
import { useEquipment, useMySlots } from "../hooks/useScheduling";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";

export const AvailabilityManager: React.FC = () => {
  const { user } = useAuth();
  const { data: slots = [], isLoading } = useMySlots(user?.id || "");
  const { data: equipment = [] } = useEquipment();
  const [modalOpen, setModalOpen] = useState(false);

  const equipmentMap = React.useMemo(
    () =>
      equipment.reduce<Record<string, string>>((acc, item) => {
        acc[item.id] = item.name;
        return acc;
      }, {}),
    [equipment],
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Navbar />
      <div className="w-full max-w-[1400px] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              My Availability
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
              Manage your availability slots for others to book
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="px-5">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Slot
          </Button>
        </div>

        <AvailabilityList
          slots={slots}
          isLoading={isLoading}
          equipmentMap={equipmentMap}
        />

        <CreateSlotModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          equipmentOptions={equipment}
        />
      </div>
    </div>
  );
};
