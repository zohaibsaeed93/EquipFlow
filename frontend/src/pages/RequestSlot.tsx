import React, { useState } from "react";
import { Navbar } from "../components/Navbar";
import {
  useSlotRequests,
  useCreateSlotRequest,
  useEquipment,
} from "../hooks/useScheduling";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import type { Equipment } from "../types/scheduling.types";
import { format } from "date-fns";
import toast from "react-hot-toast";

export const RequestSlot: React.FC = () => {
  const { data: requests = [], isLoading } = useSlotRequests();
  const { data: equipment = [] } = useEquipment();
  const createRequest = useCreateSlotRequest();
  const [modalOpen, setModalOpen] = useState(false);

  // Modal form state
  const toLocalDatetimeString = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getDefaultStart = () => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return toLocalDatetimeString(d);
  };

  const getDefaultEnd = () => {
    const d = new Date();
    d.setHours(d.getHours() + 2, 0, 0, 0);
    return toLocalDatetimeString(d);
  };

  const [startTime, setStartTime] = useState(getDefaultStart);
  const [endTime, setEndTime] = useState(getDefaultEnd);
  const [equipmentId, setEquipmentId] = useState("");

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
      await createRequest.mutateAsync({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        equipmentId: equipmentId || undefined,
      });
      toast.success("Slot request submitted!");
      setModalOpen(false);
      // Reset form
      setStartTime(getDefaultStart());
      setEndTime(getDefaultEnd());
      setEquipmentId("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to submit request");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
          >
            ● Pending Approval
          </span>
        );
      case "approved":
        return <Badge variant="success">✓ Approved</Badge>;
      case "rejected":
        return <Badge variant="danger">✕ Rejected</Badge>;
      default:
        return null;
    }
  };

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
              Request Slot
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
              Request availability slots for admin approval
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
            Request Slot
          </Button>
        </div>

        {/* Requests list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div
            className="rounded-2xl border p-12 flex flex-col items-center"
            style={{
              borderColor: "var(--card-border)",
              backgroundColor: "var(--card-bg)",
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "#fef3c7" }}
            >
              <svg
                className="w-7 h-7"
                style={{ color: "#92400e" }}
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
            </div>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              No slot requests yet
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              Click "Request Slot" to submit your first request
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="rounded-xl border p-4 transition-all duration-200"
                style={{
                  borderColor:
                    req.status === "pending"
                      ? "#fde68a"
                      : req.status === "approved"
                        ? "var(--success-muted)"
                        : "var(--danger-muted)",
                  backgroundColor: "var(--card-bg)",
                  boxShadow: "0 2px 8px var(--card-shadow)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {format(new Date(req.startTime), "MMM d, yyyy")}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {format(new Date(req.startTime), "h:mm a")} –{" "}
                        {format(new Date(req.endTime), "h:mm a")}
                      </span>
                    </div>
                    {req.equipment && (
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Equipment: {req.equipment.name}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(req.status)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Request Slot Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} className="max-w-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#fef3c7" }}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: "#92400e" }}
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
                Request Slot
              </h2>
            </div>
            <button
              onClick={() => setModalOpen(false)}
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
                onChange={(e) => setEquipmentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-colors"
              >
                <option value="">Select equipment (optional)</option>
                {equipment.map((item: Equipment) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
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
                onClick={() => setModalOpen(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={createRequest.isPending}
                className="flex-1"
              >
                {createRequest.isPending ? "Submitting..." : "Request Slot"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};
