import { apiService } from "./api.service";
import type {
  AvailabilitySlot,
  Booking,
  CreateSlotData,
  CreateBookingData,
  Equipment,
  Certification,
  CreateEquipmentData,
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

  // ── Equipment ─────────────────────────────────────────

  async getEquipment(): Promise<Equipment[]> {
    const res = await api.get("/equipment");
    return res.data.data;
  },

  async createEquipment(data: CreateEquipmentData): Promise<Equipment> {
    const res = await api.post("/equipment", data);
    return res.data.data;
  },

  async deleteEquipment(id: string): Promise<void> {
    await api.delete(`/equipment/${id}`);
  },

  async getCertifications(): Promise<Certification[]> {
    const res = await api.get("/certifications");
    return res.data.data;
  },

  async getUserCertifications(userId: string): Promise<Certification[]> {
    const res = await api.get(`/users/${userId}/certifications`);
    return res.data.data;
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
