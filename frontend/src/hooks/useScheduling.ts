import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { schedulingService } from "../services/scheduling.service";
import type {
  AvailabilitySlot,
  Booking,
  CreateSlotData,
  CreateBookingData,
  CreateEquipmentData,
  Equipment,
  CreateSlotRequestData,
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

export const slotRequestKeys = {
  all: ["slot-requests"] as const,
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
    onSuccess: (_, deletedId) => {
      qc.setQueryData<AvailabilitySlot[]>(slotKeys.all, (old = []) =>
        old.filter((slot) => slot.id !== deletedId),
      );
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
    onSuccess: (createdEquipment) => {
      qc.setQueryData<Equipment[]>(equipmentKeys.all, (current = []) => [
        ...current,
        createdEquipment,
      ]);
      qc.invalidateQueries({ queryKey: equipmentKeys.all });
      qc.invalidateQueries({ queryKey: equipmentKeys.certifications });
    },
  });
}

export function useDeleteEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schedulingService.deleteEquipment(id),
    onSuccess: (_, deletedId) => {
      qc.setQueryData<Equipment[]>(equipmentKeys.all, (current = []) =>
        current.filter((item) => item.id !== deletedId),
      );
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
    onSuccess: (createdBooking, variables) => {
      qc.setQueryData<Booking[]>(bookingKeys.all, (current = []) => {
        const next = current.filter(
          (booking) => booking.id !== createdBooking.id,
        );
        return [createdBooking, ...next];
      });

      qc.setQueriesData<AvailabilitySlot[]>(
        { queryKey: slotKeys.all },
        (current) =>
          (current || []).map((slot) =>
            slot.id === variables.slotId ? { ...slot, isBooked: true } : slot,
          ),
      );

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

// ── Slot Request Hooks ───────────────────────────────────

export function useSlotRequests() {
  return useQuery({
    queryKey: slotRequestKeys.all,
    queryFn: () => schedulingService.getSlotRequests(),
  });
}

export function useCreateSlotRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSlotRequestData) =>
      schedulingService.createSlotRequest(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: slotRequestKeys.all });
    },
  });
}

export function useApproveSlotRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schedulingService.approveSlotRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: slotRequestKeys.all });
      qc.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}

export function useRejectSlotRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schedulingService.rejectSlotRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: slotRequestKeys.all });
    },
  });
}

