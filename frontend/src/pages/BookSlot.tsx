import React, { useState } from "react";
import { Navbar } from "../components/Navbar";
import { SlotCalendar } from "../components/SlotCalendar";
import { BookingModal } from "../components/BookingModal";
import { CreateSlotModal } from "../components/CreateSlotModal";
import { useAvailableSlots } from "../hooks/useScheduling";
import type { AvailabilitySlot } from "../types/scheduling.types";

export const BookSlot: React.FC = () => {
  const { data: slots = [], isLoading } = useAvailableSlots();
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null,
  );
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createDefaultDate, setCreateDefaultDate] = useState<Date | undefined>(
    undefined,
  );

  const handleSlotClick = (slot: AvailabilitySlot) => {
    if (!slot.isBooked) {
      setSelectedSlot(slot);
      setBookingModalOpen(true);
    }
  };

  const handleEmptyClick = (date: Date) => {
    setCreateDefaultDate(date);
    setCreateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Book a Slot</h1>
          <p className="text-sm text-gray-400 mt-1">
            Browse available time slots and book one that works for you
          </p>
        </div>

        <SlotCalendar
          slots={slots}
          isLoading={isLoading}
          onSlotClick={handleSlotClick}
          onEmptyClick={handleEmptyClick}
        />

        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedSlot(null);
          }}
          slot={selectedSlot}
        />

        <CreateSlotModal
          isOpen={createModalOpen}
          onClose={() => {
            setCreateModalOpen(false);
            setCreateDefaultDate(undefined);
          }}
          defaultDate={createDefaultDate}
        />
      </div>
    </div>
  );
};
