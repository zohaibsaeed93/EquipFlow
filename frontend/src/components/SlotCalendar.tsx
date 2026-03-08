import React, { useMemo, useState } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  addWeeks,
  subWeeks,
} from "date-fns";
import type { AvailabilitySlot } from "../types/scheduling.types";

interface SlotCalendarProps {
  slots: AvailabilitySlot[];
  isLoading: boolean;
  onSlotClick: (slot: AvailabilitySlot) => void;
  onEmptyClick?: (date: Date) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7 AM – 7 PM

export const SlotCalendar: React.FC<SlotCalendarProps> = ({
  slots,
  isLoading,
  onSlotClick,
  onEmptyClick,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart],
  );

  const slotsByDayHour = useMemo(() => {
    const map = new Map<string, AvailabilitySlot[]>();
    for (const slot of slots) {
      const d = new Date(slot.startTime);
      const key = `${format(d, "yyyy-MM-dd")}-${d.getHours()}`;
      const arr = map.get(key) || [];
      arr.push(slot);
      map.set(key, arr);
    }
    return map;
  }, [slots]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-100 rounded-lg w-52" />
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Header with navigation */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-b border-gray-100">
        <button
          onClick={() => setCurrentWeekStart((p) => subWeeks(p, 1))}
          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 shadow-sm bg-white/80"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h3 className="text-base font-semibold text-gray-900">
          {format(days[0], "MMM d")} – {format(days[6], "MMM d, yyyy")}
        </h3>
        <button
          onClick={() => setCurrentWeekStart((p) => addWeeks(p, 1))}
          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 shadow-sm bg-white/80"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          {/* Day column headers */}
          <div className="grid grid-cols-[72px_repeat(7,1fr)] border-b border-gray-100">
            <div className="p-3" />
            {days.map((day) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`py-3 px-2 text-center border-l border-gray-100 ${
                    isToday ? "bg-indigo-50/60" : ""
                  }`}
                >
                  <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                    {format(day, "EEE")}
                  </div>
                  <div
                    className={`inline-flex items-center justify-center w-8 h-8 mt-0.5 rounded-full text-sm font-semibold ${
                      isToday ? "bg-indigo-600 text-white" : "text-gray-800"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time rows */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[72px_repeat(7,1fr)] border-b border-gray-50 last:border-0"
            >
              <div className="p-2 text-[11px] text-gray-400 text-right pr-4 pt-3 font-medium">
                {hour > 12
                  ? `${hour - 12} PM`
                  : hour === 12
                    ? "12 PM"
                    : `${hour} AM`}
              </div>
              {days.map((day) => {
                const key = `${format(day, "yyyy-MM-dd")}-${hour}`;
                const cellSlots = slotsByDayHour.get(key) || [];

                return (
                  <div
                    key={key}
                    onClick={() => {
                      if (cellSlots.length === 0 && onEmptyClick) {
                        const d = new Date(day);
                        d.setHours(hour, 0, 0, 0);
                        onEmptyClick(d);
                      }
                    }}
                    className={`border-l border-gray-50 min-h-[52px] p-1 transition-colors duration-200 ${
                      cellSlots.length === 0
                        ? "hover:bg-indigo-50/40 cursor-pointer"
                        : ""
                    }`}
                  >
                    {cellSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSlotClick(slot);
                        }}
                        className={`w-full text-left text-[11px] px-2 py-1.5 rounded-lg mb-0.5 truncate font-medium transition-all duration-200 border ${
                          slot.isBooked
                            ? "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100 hover:shadow-sm"
                            : "bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100 hover:shadow-sm"
                        }`}
                      >
                        {format(new Date(slot.startTime), "h:mm a")}
                        {slot.isBooked ? " · Booked" : ""}
                        {!slot.isBooked && slot.user && (
                          <span className="ml-1 opacity-60">
                            · {slot.user.name}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
