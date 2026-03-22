import React from "react";
import { Navbar } from "../components/Navbar";
import { BookingsTable } from "../components/BookingsTable";
import { useBookings, useEquipment } from "../hooks/useScheduling";

export const MyBookings: React.FC = () => {
  const { data: bookings = [], isLoading } = useBookings();
  const { data: equipment = [] } = useEquipment();

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
        <div className="mb-8">
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            My Bookings
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>
            View and manage your scheduled equipment bookings
          </p>
        </div>

        <BookingsTable
          bookings={bookings}
          isLoading={isLoading}
          equipmentMap={equipmentMap}
        />
      </div>
    </div>
  );
};
