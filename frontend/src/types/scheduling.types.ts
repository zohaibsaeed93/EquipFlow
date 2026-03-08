export interface AvailabilitySlot {
  id: string;
  userId: string;
  user?: {
    id: string;
    username: string;
    name: string;
    email?: string;
  };
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
}

export interface CreateBookingData {
  slotId: string;
}
