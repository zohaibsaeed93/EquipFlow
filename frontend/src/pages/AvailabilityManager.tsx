import React, { useState } from "react";
import { Navbar } from "../components/Navbar";
import { AvailabilityList } from "../components/AvailabilityList";
import { CreateSlotModal } from "../components/CreateSlotModal";
import { useMySlots } from "../hooks/useScheduling";
import { useAuth } from "../hooks/useAuth";

export const AvailabilityManager: React.FC = () => {
  const { user } = useAuth();
  const { data: slots = [], isLoading } = useMySlots(user?.id || "");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Availability
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage your availability slots for others to book
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-sm shadow-indigo-200"
          >
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
          </button>
        </div>

        <AvailabilityList slots={slots} isLoading={isLoading} />

        <CreateSlotModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </div>
  );
};
