import { apiService } from "./api.service";
import type {
  AvailabilitySlot,
  Booking,
  CreateSlotData,
  CreateBookingData,
} from "../types/scheduling.types";

const api = apiService.getAxiosInstance();

export const schedulingService = {
  // ── Slots ──────────────────────────────────────────────

  async createSlot(data: CreateSlotData): Promise<AvailabilitySlot> {
    const res = await api.post("/slots", data);
    return res.data.data;
  },

  async getAvailableSlots(): Promise<AvailabilitySlot[]> {
    const res = await api.get("/slots", { params: { available: true } });
    return res.data.data;
  },

  async getAllSlots(): Promise<AvailabilitySlot[]> {
    const res = await api.get("/slots");
    return res.data.data;
  },

  async getMySlots(userId: string): Promise<AvailabilitySlot[]> {
    const res = await api.get("/slots", { params: { userId } });
    return res.data.data;
  },

  async getSlotById(id: string): Promise<AvailabilitySlot> {
    const res = await api.get(`/slots/${id}`);
    return res.data.data;
  },

  async deleteSlot(id: string): Promise<void> {
    await api.delete(`/slots/${id}`);
  },

  // ── Bookings ───────────────────────────────────────────

  async createBooking(data: CreateBookingData): Promise<Booking> {
    const res = await api.post("/bookings", data);
    return res.data.data;
  },

  async getBookings(): Promise<Booking[]> {
    const res = await api.get("/bookings");
    return res.data.data;
  },

  async cancelBooking(bookingId: string): Promise<Booking> {
    const res = await api.patch(`/bookings/${bookingId}/cancel`);
    return res.data.data;
  },
};
