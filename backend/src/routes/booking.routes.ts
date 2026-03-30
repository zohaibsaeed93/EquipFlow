import { Router } from "express";
import { bookingController } from "../controllers/booking.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// All booking routes require authentication
router.use(authMiddleware);

// Create a new booking
router.post("/", (req, res) => bookingController.createBooking(req, res));

// Get bookings (admins see all, users see their own)
router.get("/", (req, res) => bookingController.getBookings(req, res));

// Cancel a booking
router.patch("/:id/cancel", (req, res) =>
  bookingController.cancelBooking(req, res),
);

export default router;
