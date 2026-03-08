import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database";
import { Booking, BookingStatus } from "../entities/Booking.entity";
import { AvailabilitySlot } from "../entities/AvailabilitySlot.entity";

export class BookingService {
  private bookingRepository: Repository<Booking>;
  private slotRepository: Repository<AvailabilitySlot>;

  constructor() {
    this.bookingRepository = AppDataSource.getRepository(Booking);
    this.slotRepository = AppDataSource.getRepository(AvailabilitySlot);
  }

  /**
   * Book a slot using a database transaction to prevent race conditions
   */
  async bookSlot(data: { slotId: string; bookedBy: string }): Promise<Booking> {
    const { slotId, bookedBy } = data;

    // Use a transaction to prevent race conditions
    return await AppDataSource.transaction(async (manager) => {
      // Lock the slot row for update
      const slot = await manager
        .getRepository(AvailabilitySlot)
        .createQueryBuilder("slot")
        .setLock("pessimistic_write")
        .where("slot.id = :slotId", { slotId })
        .getOne();

      if (!slot) {
        throw new Error("Slot not found");
      }

      if (slot.isBooked) {
        throw new Error("This slot is already booked");
      }

      if (slot.startTime <= new Date()) {
        throw new Error("Cannot book a slot in the past");
      }

      if (slot.userId === bookedBy) {
        throw new Error("You cannot book your own availability slot");
      }

      // Mark slot as booked
      slot.isBooked = true;
      await manager.save(slot);

      // Create booking record
      const booking = manager.getRepository(Booking).create({
        slotId,
        bookedBy,
        status: BookingStatus.BOOKED,
      });

      return await manager.save(booking);
    });
  }

  /**
   * Cancel a booking — only the booker or an admin can cancel
   */
  async cancelBooking(
    bookingId: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<Booking> {
    return await AppDataSource.transaction(async (manager) => {
      const booking = await manager.getRepository(Booking).findOne({
        where: { id: bookingId },
        relations: ["slot"],
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status === BookingStatus.CANCELLED) {
        throw new Error("Booking is already cancelled");
      }

      if (booking.bookedBy !== userId && !isAdmin) {
        throw new Error("Not authorized to cancel this booking");
      }

      // Update booking status
      booking.status = BookingStatus.CANCELLED;
      await manager.save(booking);

      // Mark slot as available again
      const slot = await manager
        .getRepository(AvailabilitySlot)
        .findOne({ where: { id: booking.slotId } });

      if (slot) {
        slot.isBooked = false;
        await manager.save(slot);
      }

      return booking;
    });
  }

  /**
   * Get all bookings for a user (bookings they made)
   */
  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { bookedBy: userId },
      relations: ["slot", "slot.user", "bookedByUser"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Get all bookings (admin)
   */
  async getAllBookings(): Promise<Booking[]> {
    return await this.bookingRepository.find({
      relations: ["slot", "slot.user", "bookedByUser"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Get a single booking by ID
   */
  async getBookingById(id: string): Promise<Booking | null> {
    return await this.bookingRepository.findOne({
      where: { id },
      relations: ["slot", "slot.user", "bookedByUser"],
    });
  }
}

export const bookingService = new BookingService();
