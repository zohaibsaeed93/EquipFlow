import React from "react";
import { Navbar } from "../components/Navbar";
import { BookingsTable } from "../components/BookingsTable";
import { useBookings } from "../hooks/useScheduling";

export const MyBookings: React.FC = () => {
  const { data: bookings = [], isLoading } = useBookings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-sm text-gray-400 mt-1">
            View and manage your scheduled bookings
          </p>
        </div>

        <BookingsTable bookings={bookings} isLoading={isLoading} />
      </div>
    </div>
  );
};
