import React, { useMemo, useState } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  addWeeks,
  subWeeks,
} from "date-fns";
import type { AvailabilitySlot, SlotRequest } from "../types/scheduling.types";

interface SlotCalendarProps {
  slots: AvailabilitySlot[];
  slotRequests?: SlotRequest[];
  isLoading: boolean;
  onSlotClick: (slot: AvailabilitySlot) => void;
  onRequestClick?: (request: SlotRequest) => void;
  onEmptyClick?: (date: Date) => void;
  equipmentMap?: Record<string, string>;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7 AM – 7 PM

export const SlotCalendar: React.FC<SlotCalendarProps> = ({
  slots,
  slotRequests = [],
  isLoading,
  onSlotClick,
  onRequestClick,
  onEmptyClick,
  equipmentMap,
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

  // Separate map for slot requests — never merged with slots
  const requestsByDayHour = useMemo(() => {
    const map = new Map<string, SlotRequest[]>();
    for (const req of slotRequests) {
      if (req.status !== "pending") continue; // only show pending on calendar
      const d = new Date(req.startTime);
      const key = `${format(d, "yyyy-MM-dd")}-${d.getHours()}`;
      const arr = map.get(key) || [];
      arr.push(req);
      map.set(key, arr);
    }
    return map;
  }, [slotRequests]);

  if (isLoading) {
    return (
      <div
        className="rounded-2xl border p-8"
        style={{
          borderColor: "var(--card-border)",
          backgroundColor: "var(--card-bg)",
        }}
      >
        <div className="space-y-4">
          <div className="skeleton h-6 w-52" />
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="skeleton h-12" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        borderColor: "var(--card-border)",
        backgroundColor: "var(--card-bg)",
        boxShadow: "0 4px 16px var(--card-shadow)",
      }}
    >
      {/* Header with navigation */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <button
          onClick={() => setCurrentWeekStart((p) => subWeeks(p, 1))}
          className="p-2 rounded-lg transition-all duration-200"
          style={{
            color: "var(--text-tertiary)",
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
            e.currentTarget.style.borderColor = "var(--border-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-tertiary)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
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
        <h3
          className="text-base font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {format(days[0], "MMM d")} – {format(days[6], "MMM d, yyyy")}
        </h3>
        <button
          onClick={() => setCurrentWeekStart((p) => addWeeks(p, 1))}
          className="p-2 rounded-lg transition-all duration-200"
          style={{
            color: "var(--text-tertiary)",
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
            e.currentTarget.style.borderColor = "var(--border-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-tertiary)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
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
          <div
            className="grid grid-cols-[72px_repeat(7,1fr)] border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="p-3" />
            {days.map((day) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className="py-3 px-2 text-center border-l"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: isToday
                      ? "var(--accent-muted)"
                      : "transparent",
                  }}
                >
                  <div
                    className="text-[11px] font-medium uppercase tracking-wide"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {format(day, "EEE")}
                  </div>
                  <div
                    className="inline-flex items-center justify-center w-8 h-8 mt-0.5 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: isToday
                        ? "var(--accent)"
                        : "transparent",
                      color: isToday ? "#fff" : "var(--text-primary)",
                    }}
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
              className="grid grid-cols-[72px_repeat(7,1fr)] border-b last:border-0"
              style={{ borderColor: "var(--divider)" }}
            >
              <div
                className="p-2 text-[11px] text-right pr-4 pt-3 font-medium"
                style={{ color: "var(--text-tertiary)" }}
              >
                {hour > 12
                  ? `${hour - 12} PM`
                  : hour === 12
                    ? "12 PM"
                    : `${hour} AM`}
              </div>
              {days.map((day) => {
                const key = `${format(day, "yyyy-MM-dd")}-${hour}`;
                const cellSlots = slotsByDayHour.get(key) || [];
                const cellRequests = requestsByDayHour.get(key) || [];

                return (
                  <div
                    key={key}
                    onClick={() => {
                      if (cellSlots.length === 0 && cellRequests.length === 0 && onEmptyClick) {
                        const d = new Date(day);
                        d.setHours(hour, 0, 0, 0);
                        onEmptyClick(d);
                      }
                    }}
                    className="border-l min-h-[52px] p-1 transition-colors duration-200"
                    style={{
                      borderColor: "var(--divider)",
                      cursor:
                        cellSlots.length === 0 && cellRequests.length === 0 && onEmptyClick
                          ? "pointer"
                          : "default",
                    }}
                    onMouseEnter={(e) => {
                      if (cellSlots.length === 0 && cellRequests.length === 0) {
                        e.currentTarget.style.backgroundColor =
                          "var(--accent-muted)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {/* Regular slots (green/red) */}
                    {cellSlots.map((slot) => {
                      const equipmentLabel =
                        slot.equipment?.name ||
                        (slot.equipmentId
                          ? equipmentMap?.[slot.equipmentId]
                          : undefined);

                      return (
                        <button
                          key={slot.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSlotClick?.(slot);
                          }}
                          className="w-full text-left text-[11px] px-2 py-1.5 rounded-lg mb-0.5 truncate font-medium transition-all duration-200 border"
                          style={{
                            backgroundColor: slot.isBooked
                              ? "var(--danger-muted)"
                              : "var(--success-muted)",
                            color: slot.isBooked
                              ? "var(--danger)"
                              : "var(--success)",
                            borderColor: slot.isBooked
                              ? "var(--danger-muted)"
                              : "var(--success-muted)",
                            cursor: "pointer",
                          }}
                        >
                          {format(new Date(slot.startTime), "h:mm a")}
                          {slot.isBooked ? " · Booked" : ""}
                          {equipmentLabel && (
                            <span className="ml-1 opacity-70">
                              · {equipmentLabel}
                            </span>
                          )}
                          {!slot.isBooked && slot.user && (
                            <span className="ml-1 opacity-60">
                              · {slot.user.name}
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {/* Slot requests (yellow) — separate from slots */}
                    {cellRequests.map((req) => {
                      const equipmentLabel =
                        req.equipment?.name ||
                        (req.equipmentId
                          ? equipmentMap?.[req.equipmentId]
                          : undefined);

                      return (
                        <button
                          key={`req-${req.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRequestClick?.(req);
                          }}
                          className="w-full text-left text-[11px] px-2 py-1.5 rounded-lg mb-0.5 truncate font-medium transition-all duration-200 border"
                          style={{
                            backgroundColor: "#fef3c7",
                            color: "#92400e",
                            borderColor: "#fde68a",
                            cursor: onRequestClick ? "pointer" : "default",
                          }}
                        >
                          {format(new Date(req.startTime), "h:mm a")}
                          {" · Requested by: "}
                          {req.requestedByUser?.name || "User"}
                          {equipmentLabel && (
                            <span className="ml-1 opacity-70">
                              · {equipmentLabel}
                            </span>
                          )}
                        </button>
                      );
                    })}
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


