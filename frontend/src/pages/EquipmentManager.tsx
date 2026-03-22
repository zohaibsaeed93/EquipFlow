import React, { useMemo, useState } from "react";
import { Navbar } from "../components/Navbar";
import {
  useCertifications,
  useCreateEquipment,
  useDeleteEquipment,
  useEquipment,
} from "../hooks/useScheduling";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import toast from "react-hot-toast";

export const EquipmentManager: React.FC = () => {
  const { data: equipment = [] } = useEquipment();
  const { data: certifications = [] } = useCertifications();
  const createEquipment = useCreateEquipment();
  const deleteEquipment = useDeleteEquipment();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [equipmentName, setEquipmentName] = useState("");
  const [selectedCertIds, setSelectedCertIds] = useState<string[]>([]);

  const sortedEquipment = useMemo(
    () => [...equipment].sort((a, b) => a.name.localeCompare(b.name)),
    [equipment],
  );

  const toggleCert = (id: string) => {
    setSelectedCertIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleCreate = async () => {
    if (!equipmentName.trim()) {
      toast.error("Enter an equipment name");
      return;
    }

    try {
      await createEquipment.mutateAsync({
        name: equipmentName.trim(),
        certificationIds: selectedCertIds,
      });
      toast.success("Equipment created");
      setCreateOpen(false);
      setEquipmentName("");
      setSelectedCertIds([]);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to create equipment");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteEquipment.mutateAsync(deleteTarget);
      toast.success("Equipment deleted");
      setDeleteTarget(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to delete equipment");
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Navbar />
      <div className="w-full max-w-[1400px] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Equipment Management
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
              Create and maintain equipment with certification requirements and dependencies.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Equipment
          </Button>
        </div>

        {sortedEquipment.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center py-12">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: "var(--accent-muted)" }}
              >
                <svg className="w-7 h-7" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.66-5.66a8 8 0 1111.32 0l-5.66 5.66z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L7.75 21h8.34l-3.67-5.83z" />
                </svg>
              </div>
              <p
                className="text-base font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                No equipment registered yet
              </p>
              <p
                className="text-sm mt-1 mb-4"
                style={{ color: "var(--text-tertiary)" }}
              >
                Add your first piece of equipment to get started
              </p>
              <Button onClick={() => setCreateOpen(true)}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Equipment
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedEquipment.map((item) => (
              <Card key={item.id} className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className="text-base font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {item.requirements?.length
                          ? `${item.requirements.length} required certification${item.requirements.length > 1 ? "s" : ""}`
                          : "No certification requirements"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => setDeleteTarget(item.id)}
                  >
                    Delete
                  </Button>
                </div>

                {/* Dependencies */}
                {item.dependencies && item.dependencies.length > 0 && (
                  <div className="mt-3">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Dependencies
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {item.dependencies.map((dep) => (
                        <Badge key={dep.id} variant="info" className="text-[10px]">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.008a4.5 4.5 0 00-6.364-6.364L4.758 8.25l4.5 4.5a4.5 4.5 0 007.244 1.242" />
                          </svg>
                          {dep.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {item.requirements?.length ? (
                  <div className="mt-3">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Required Certifications
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {item.requirements.map((req) => (
                        <Badge key={req.id} variant="warning" className="text-[10px]">
                          {req.certification?.name || "Certification"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)}>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Add Equipment
        </h2>
        <div className="space-y-4">
          <div>
            <label
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Equipment name
            </label>
            <input
              value={equipmentName}
              onChange={(event) => setEquipmentName(event.target.value)}
              className="mt-1 w-full rounded-xl px-3 py-2 text-sm"
              placeholder="e.g., 3D Printer"
            />
          </div>
          <div>
            <label
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Required certifications
            </label>
            {certifications.length === 0 ? (
              <p
                className="mt-2 text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                No certifications configured.
              </p>
            ) : (
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {certifications.map((cert) => (
                  <label
                    key={cert.id}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors"
                    style={{
                      borderColor: selectedCertIds.includes(cert.id)
                        ? "var(--accent)"
                        : "var(--border)",
                      backgroundColor: selectedCertIds.includes(cert.id)
                        ? "var(--accent-muted)"
                        : "var(--bg-secondary)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCertIds.includes(cert.id)}
                      onChange={() => toggleCert(cert.id)}
                      className="accent-[var(--accent)]"
                    />
                    {cert.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setCreateOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            isLoading={createEquipment.isPending}
            onClick={handleCreate}
          >
            {createEquipment.isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--danger-muted)" }}
          >
            <svg className="w-5 h-5" style={{ color: "var(--danger)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </div>
          <div>
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Delete equipment?
            </h2>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              This will remove the equipment and any associated requirements.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setDeleteTarget(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            isLoading={deleteEquipment.isPending}
            onClick={handleDelete}
          >
            {deleteEquipment.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
