export interface AvailabilitySlot {
  id: string;
  userId: string;
  equipmentId?: string;
  equipment?: Equipment;
  user?: {
    id: string;
    username: string;
    name: string;
    email?: string;
  };
  bookings?: Booking[];
  startTime: string;
  endTime: string;
  isBooked: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = "booked" | "cancelled";

export interface Booking {
  id: string;
  slotId: string;
  slot?: AvailabilitySlot;
  bookedBy: string;
  bookedByUser?: {
    id: string;
    username: string;
    name: string;
  };
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSlotData {
  startTime: string;
  endTime: string;
  equipmentId?: string;
}

export interface CreateBookingData {
  slotId: string;
}

export interface BookingSuggestion {
  startTime: string;
  endTime: string;
}

export interface Certification {
  id: string;
  name: string;
}

export interface EquipmentRequirement {
  id: string;
  certificationId: string;
  certification?: Certification;
}

export interface Equipment {
  id: string;
  name: string;
  requirements?: EquipmentRequirement[];
  dependencies?: Equipment[];
}

export interface CreateEquipmentData {
  name: string;
  certificationIds?: string[];
  dependencyIds?: string[];
}

// ── Slot Requests ─────────────────────────────────────────

export type SlotRequestStatus = "pending" | "approved" | "rejected";

export interface SlotRequest {
  id: string;
  requestedBy: string;
  requestedByUser?: {
    id: string;
    username: string;
    name: string;
  };
  equipmentId?: string;
  equipment?: Equipment;
  startTime: string;
  endTime: string;
  status: SlotRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSlotRequestData {
  startTime: string;
  endTime: string;
  equipmentId?: string;
}
