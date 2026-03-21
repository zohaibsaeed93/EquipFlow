import { Request, Response } from "express";
import { bookingService, HttpError } from "../services/booking.service";
import { UserRole } from "../entities/User.entity";

export class BookingController {
  /**
   * Book a slot
   * POST /api/bookings
   */
  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const { slotId, equipmentId } = req.body;
      const bookedBy = req.user!.userId;

      if (!slotId) {
        res.status(400).json({
          error: "Missing required field",
          required: ["slotId"],
        });
        return;
      }

      const booking = await bookingService.bookSlot({
        slotId,
        bookedBy,
        equipmentId,
      });

      res.status(201).json({
        message: "Slot booked successfully",
        data: booking,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        const payload = error.details
          ? { error: error.message, ...error.details }
          : { error: error.message };
        res.status(error.statusCode).json(payload);
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create booking" });
      }
    }
  }

  /**
   * Get bookings
   * GET /api/bookings
   * Admins see all bookings, regular users see only their own
   */
  async getBookings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const isAdmin = req.user!.role === UserRole.ADMIN;

      const bookings = isAdmin
        ? await bookingService.getAllBookings()
        : await bookingService.getBookingsByUser(userId);

      res.status(200).json({ data: bookings });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  }

  /**
   * Cancel a booking
   * PATCH /api/bookings/:id/cancel
   */
  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const isAdmin = req.user!.role === UserRole.ADMIN;

      const booking = await bookingService.cancelBooking(
        req.params.id as string,
        userId,
        isAdmin,
      );

      res.status(200).json({
        message: "Booking cancelled successfully",
        data: booking,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        const payload = error.details
          ? { error: error.message, ...error.details }
          : { error: error.message };
        res.status(error.statusCode).json(payload);
      } else if (error instanceof Error) {
        if (error.message === "Booking not found") {
          res.status(404).json({ error: error.message });
        } else if (error.message === "Not authorized to cancel this booking") {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: "Failed to cancel booking" });
      }
    }
  }
}

export const bookingController = new BookingController();
