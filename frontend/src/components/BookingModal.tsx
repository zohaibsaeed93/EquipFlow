import React from "react";
import { useCreateBooking } from "../hooks/useScheduling";
import { differenceInMinutes, format } from "date-fns";
import toast from "react-hot-toast";
import type {
  AvailabilitySlot,
  BookingSuggestion,
  Certification,
  Equipment,
} from "../types/scheduling.types";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: AvailabilitySlot | null;
  allSlots: AvailabilitySlot[];
  equipment: Equipment[];
  userCertifications: Certification[];
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  slot,
  allSlots,
  equipment,
  userCertifications,
}) => {
  const createBooking = useCreateBooking();
  const [suggestions, setSuggestions] = React.useState<BookingSuggestion[]>([]);
  const [bookingError, setBookingError] = React.useState<string>("");
  const [isApplyingSuggestion, setIsApplyingSuggestion] = React.useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] =
    React.useState<string>("");

  React.useEffect(() => {
    if (isOpen) {
      setSuggestions([]);
      setBookingError("");
      setIsApplyingSuggestion(false);
      const slotEquipmentId = slot?.equipmentId;
      const equipmentExists = slotEquipmentId
        ? equipment.some((item) => item.id === slotEquipmentId)
        : false;
      setSelectedEquipmentId(
        equipmentExists ? (slotEquipmentId ?? "") : equipment[0]?.id || "",
      );
    }
  }, [isOpen, slot?.id, slot?.equipmentId, equipment]);

  if (!isOpen || !slot) return null;

  const selectedEquipment = equipment.find(
    (item) => item.id === selectedEquipmentId,
  );

  const userCertificationIds = new Set(
    userCertifications.map((cert) => cert.id),
  );

  const requiredCertifications =
    selectedEquipment?.requirements
      ?.map((req) => req.certification)
      .filter((cert): cert is Certification => !!cert) || [];

  const missingCertifications = requiredCertifications.filter(
    (cert) => !userCertificationIds.has(cert.id),
  );

  const handleConfirm = async () => {
    try {
      setBookingError("");
      setSuggestions([]);

      if (equipment.length === 0) {
        setBookingError("Equipment list is unavailable. Please try again.");
        return;
      }

      if (!selectedEquipmentId) {
        setBookingError("Please select equipment before booking.");
        return;
      }

      if (missingCertifications.length > 0) {
        setBookingError(
          "You are missing required certifications for this equipment.",
        );
        return;
      }

      await createBooking.mutateAsync({
        slotId: slot.id,
        equipmentId: selectedEquipmentId,
      });
      toast.success("Slot booked successfully!");
      onClose();
    } catch (err: unknown) {
      const error = err as {
        response?: {
          status?: number;
          data?: { error?: string; suggestions?: BookingSuggestion[] };
        };
      };
      const message = error.response?.data?.error || "Failed to book slot";
      const nextSuggestions = error.response?.data?.suggestions || [];

      if (error.response?.status === 409) {
        toast.error("Slot unavailable");
      } else {
        toast.error(message);
      }

      setBookingError(message);
      setSuggestions(nextSuggestions);
    }
  };

  const handleBookSuggestion = async (candidate: BookingSuggestion) => {
    if (!selectedEquipmentId) {
      toast.error("Select equipment before booking a suggestion");
      return;
    }

    const suggestedSlot = allSlots.find((availableSlot) => {
      const slotStart = new Date(availableSlot.startTime).getTime();
      const slotEnd = new Date(availableSlot.endTime).getTime();
      const suggestionStart = new Date(candidate.startTime).getTime();
      const suggestionEnd = new Date(candidate.endTime).getTime();

      return (
        !availableSlot.isBooked &&
        slotStart === suggestionStart &&
        slotEnd === suggestionEnd
      );
    });

    if (!suggestedSlot) {
      toast.error("Suggested time is no longer available as a slot");
      return;
    }

    try {
      setIsApplyingSuggestion(true);
      await createBooking.mutateAsync({
        slotId: suggestedSlot.id,
        equipmentId: selectedEquipmentId,
      });
      toast.success("Suggested slot booked successfully!");
      onClose();
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: { error?: string; suggestions?: BookingSuggestion[] };
        };
      };
      const message =
        error.response?.data?.error || "Failed to book suggested slot";
      toast.error(message);
      setBookingError(message);
      setSuggestions(error.response?.data?.suggestions || suggestions);
    } finally {
      setIsApplyingSuggestion(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--success-muted)" }}
          >
            <svg
              className="w-5 h-5"
              style={{ color: "var(--success)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Confirm Booking
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-tertiary)";
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Booking details */}
      <div
        className="mb-6 space-y-3 rounded-xl border p-4"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Host
          </span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
              <span className="text-[9px] font-bold text-white">
                {(slot.user?.name || "?").charAt(0).toUpperCase()}
              </span>
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {slot.user?.name || "Unknown"}
            </span>
          </div>
        </div>

        <div className="border-t" style={{ borderColor: "var(--divider)" }} />

        <div className="flex justify-between">
          <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Date
          </span>
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {format(new Date(slot.startTime), "EEEE, MMM d, yyyy")}
          </span>
        </div>

        <div className="border-t" style={{ borderColor: "var(--divider)" }} />

        <div className="flex justify-between">
          <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Time
          </span>
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {format(new Date(slot.startTime), "h:mm a")} –{" "}
            {format(new Date(slot.endTime), "h:mm a")}
          </span>
        </div>

        <div className="border-t" style={{ borderColor: "var(--divider)" }} />

        {/* Equipment selector */}
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Equipment
          </label>
          <select
            value={selectedEquipmentId}
            onChange={(event) => setSelectedEquipmentId(event.target.value)}
            disabled={!!slot.equipmentId}
            className="w-full rounded-xl px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Select equipment
            </option>
            {equipment.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {slot.equipmentId && (
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              Equipment is fixed for this slot.
            </p>
          )}
          {equipment.length === 0 && (
            <p className="text-xs" style={{ color: "var(--danger)" }}>
              No equipment available for booking.
            </p>
          )}
        </div>

        <div className="border-t" style={{ borderColor: "var(--divider)" }} />

        {/* Certification status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span
              className="text-sm"
              style={{ color: "var(--text-tertiary)" }}
            >
              Required certifications
            </span>
            <Badge
              variant={missingCertifications.length > 0 ? "warning" : "success"}
            >
              {missingCertifications.length > 0
                ? `${missingCertifications.length} missing`
                : "✓ All satisfied"}
            </Badge>
          </div>
          {requiredCertifications.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              No certifications required.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {requiredCertifications.map((cert) => {
                const isMissing = missingCertifications.some(
                  (item) => item.id === cert.id,
                );
                return (
                  <Badge
                    key={cert.id}
                    variant={isMissing ? "danger" : "success"}
                  >
                    {isMissing ? "✕" : "✓"} {cert.name}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {bookingError && (
        <div
          className="mb-4 rounded-xl border px-4 py-3 text-sm flex items-center gap-2"
          style={{
            borderColor: "var(--danger-muted)",
            backgroundColor: "var(--danger-muted)",
            color: "var(--danger)",
          }}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {bookingError}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: "var(--warning)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
              <h3
                className="text-base font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Suggested alternatives
              </h3>
            </div>
            <Badge variant="info">{suggestions.length} options</Badge>
          </div>
          <div className="grid gap-3">
            {suggestions.map((suggestion) => {
              const start = new Date(suggestion.startTime);
              const end = new Date(suggestion.endTime);
              const durationMinutes = differenceInMinutes(end, start);
              return (
                <div
                  key={`${suggestion.startTime}-${suggestion.endTime}`}
                  className="rounded-xl border p-4 transition-all duration-200"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--card-bg)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 1px var(--accent-muted)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {format(start, "EEEE, MMM d, yyyy")}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {format(start, "h:mm a")} – {format(end, "h:mm a")}
                      </p>
                      <p
                        className="mt-1 text-xs"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        Duration: {durationMinutes} minutes
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleBookSuggestion(suggestion)}
                      isLoading={isApplyingSuggestion}
                      className="w-full sm:w-auto"
                    >
                      Book this instead
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={onClose}
          variant="secondary"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          isLoading={createBooking.isPending}
          disabled={missingCertifications.length > 0 || !selectedEquipmentId}
          className="flex-1"
        >
          {createBooking.isPending ? "Booking..." : "Confirm Booking"}
        </Button>
      </div>
    </Modal>
  );
};
