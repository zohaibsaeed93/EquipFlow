import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { useMySlots, useBookings } from "../hooks/useScheduling";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: slots = [] } = useMySlots(user?.id || "");
  const { data: bookings = [] } = useBookings();

  const availableSlots = slots.filter((s) => !s.isBooked);
  const bookedSlots = slots.filter((s) => s.isBooked);
  const activeBookings = bookings.filter((b) => b.status === "booked");

  const stats = [
    {
      label: "Total Slots",
      value: slots.length,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
      ),
      gradient: "from-indigo-500 to-indigo-600",
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      to: "/availability",
    },
    {
      label: "Available",
      value: availableSlots.length,
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
      gradient: "from-sky-500 to-sky-600",
      bg: "bg-sky-50",
      text: "text-sky-600",
      to: "/availability",
    },
    {
      label: "Booked Out",
      value: bookedSlots.length,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      to: "/availability",
    },
    {
      label: "My Bookings",
      value: activeBookings.length,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      ),
      gradient: "from-amber-500 to-amber-600",
      bg: "bg-amber-50",
      text: "text-amber-600",
      to: "/bookings",
    },
  ];

  const quickActions = [
    {
      label: "Manage Availability",
      to: "/availability",
      primary: true,
    },
    {
      label: "Book a Slot",
      to: "/book",
      primary: false,
    },
    {
      label: "View My Bookings",
      to: "/bookings",
      primary: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-500 mt-1">
            Here's an overview of your scheduling activity
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat) => (
            <button
              key={stat.label}
              onClick={() => navigate(stat.to)}
              className="group relative bg-white rounded-2xl border border-gray-100 p-6 text-left hover:shadow-lg hover:shadow-gray-100 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.text} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                >
                  {stat.icon}
                </div>
              </div>
              <span className="block text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </span>
              <span className="text-sm text-gray-500">{stat.label}</span>
            </button>
          ))}
        </div>

        {/* Quick actions + Profile row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.to)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                    action.primary
                      ? "text-white bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
                      : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Your Profile
            </h2>
            <div className="space-y-3">
              {[
                { label: "Username", value: user?.username },
                { label: "Name", value: user?.name },
                { label: "Email", value: user?.email || "—" },
                { label: "Role", value: user?.role },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm text-gray-400">{label}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
