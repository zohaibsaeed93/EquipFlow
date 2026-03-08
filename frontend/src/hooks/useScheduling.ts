import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { schedulingService } from "../services/scheduling.service";
import type {
  CreateSlotData,
  CreateBookingData,
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
