import { Router } from "express";
import { bookingController } from "../controllers/booking.controller";
import { authMiddleware, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../entities/User.entity";

const router = Router();

// All booking routes require authentication
router.use(authMiddleware);

// Create a new booking — user only (admins manage equipment, not book it)
router.post("/", authorize(UserRole.USER), (req, res) => bookingController.createBooking(req, res));

// Get bookings (admins see all, users see their own)
router.get("/", (req, res) => bookingController.getBookings(req, res));

// Cancel a booking
router.patch("/:id/cancel", (req, res) =>
  bookingController.cancelBooking(req, res),
);

export default router;
