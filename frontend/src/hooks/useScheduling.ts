import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { schedulingService } from "../services/scheduling.service";
import type {
  CreateSlotData,
  CreateBookingData,
  CreateEquipmentData,
} from "../types/scheduling.types";

// ── Query Keys ───────────────────────────────────────────

export const slotKeys = {
  all: ["slots"] as const,
  available: ["slots", "available"] as const,
  my: (userId: string) => ["slots", "my", userId] as const,
  detail: (id: string) => ["slots", id] as const,
};

export const bookingKeys = {
  all: ["bookings"] as const,
};

export const equipmentKeys = {
  all: ["equipment"] as const,
  certifications: ["certifications"] as const,
  userCerts: (userId: string) => ["certifications", "user", userId] as const,
};

// ── Slot Hooks ───────────────────────────────────────────

export function useAvailableSlots() {
  return useQuery({
    queryKey: slotKeys.available,
    queryFn: () => schedulingService.getAvailableSlots(),
  });
}

export function useAllSlots() {
  return useQuery({
    queryKey: slotKeys.all,
    queryFn: () => schedulingService.getAllSlots(),
  });
}

export function useMySlots(userId: string) {
  return useQuery({
    queryKey: slotKeys.my(userId),
    queryFn: () => schedulingService.getMySlots(userId),
    enabled: !!userId,
  });
}

export function useCreateSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSlotData) => schedulingService.createSlot(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}

export function useDeleteSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schedulingService.deleteSlot(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}

// ── Equipment Hooks ─────────────────────────────────────

export function useEquipment() {
  return useQuery({
    queryKey: equipmentKeys.all,
    queryFn: () => schedulingService.getEquipment(),
  });
}

export function useCertifications() {
  return useQuery({
    queryKey: equipmentKeys.certifications,
    queryFn: () => schedulingService.getCertifications(),
  });
}

export function useUserCertifications(userId: string) {
  return useQuery({
    queryKey: equipmentKeys.userCerts(userId),
    queryFn: () => schedulingService.getUserCertifications(userId),
    enabled: !!userId,
  });
}

export function useCreateEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEquipmentData) =>
      schedulingService.createEquipment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: equipmentKeys.all });
      qc.invalidateQueries({ queryKey: equipmentKeys.certifications });
    },
  });
}

export function useDeleteEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schedulingService.deleteEquipment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: equipmentKeys.all });
    },
  });
}

// ── Booking Hooks ────────────────────────────────────────

export function useBookings() {
  return useQuery({
    queryKey: bookingKeys.all,
    queryFn: () => schedulingService.getBookings(),
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingData) =>
      schedulingService.createBooking(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slots"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) =>
      schedulingService.cancelBooking(bookingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slots"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
