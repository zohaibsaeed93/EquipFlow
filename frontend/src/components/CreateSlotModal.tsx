import React, { useState } from "react";
import { useCreateSlot } from "../hooks/useScheduling";
import toast from "react-hot-toast";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import type { Equipment } from "../types/scheduling.types";

interface CreateSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: Date;
  equipmentOptions?: Equipment[];
}

export const CreateSlotModal: React.FC<CreateSlotModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  equipmentOptions = [],
}) => {
  const createSlot = useCreateSlot();

  const toLocalDatetimeString = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getDefaultStart = () => {
    if (defaultDate) {
      const d = new Date(defaultDate);
      d.setHours(9, 0, 0, 0);
      return toLocalDatetimeString(d);
    }
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return toLocalDatetimeString(d);
  };

  const getDefaultEnd = () => {
    if (defaultDate) {
      const d = new Date(defaultDate);
      d.setHours(10, 0, 0, 0);
      return toLocalDatetimeString(d);
    }
    const d = new Date();
    d.setHours(d.getHours() + 2, 0, 0, 0);
    return toLocalDatetimeString(d);
  };

  const [startTime, setStartTime] = useState(getDefaultStart);
  const [endTime, setEndTime] = useState(getDefaultEnd);
  const [equipmentId, setEquipmentId] = useState(equipmentOptions[0]?.id || "");

  React.useEffect(() => {
    if (!equipmentId && equipmentOptions.length > 0) {
      setEquipmentId(equipmentOptions[0].id);
    }
  }, [equipmentOptions, equipmentId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      toast.error("Start time must be before end time");
      return;
    }

    if (start <= new Date()) {
      toast.error("Slot must be in the future");
      return;
    }

    try {
      await createSlot.mutateAsync({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        equipmentId: equipmentId || undefined,
      });
      toast.success("Availability slot created!");
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to create slot");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--accent-muted)" }}
          >
            <svg
              className="w-5 h-5"
              style={{ color: "var(--accent)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Create Availability Slot
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Equipment
          </label>
          <select
            value={equipmentId}
            onChange={(event) => setEquipmentId(event.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <option value="">Select equipment</option>
            {equipmentOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
            Associate this slot with specific equipment.
          </p>
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Start Time
          </label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-colors"
            required
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            End Time
          </label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-colors"
            required
          />
        </div>

        <div className="flex gap-3 pt-3">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={createSlot.isPending}
            className="flex-1"
          >
            {createSlot.isPending ? "Creating..." : "Create Slot"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
