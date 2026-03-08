import { Router } from "express";
import userRoutes from "./user.routes";
import slotRoutes from "./slot.routes";
import bookingRoutes from "./booking.routes";

const router = Router();

// Mount routes
router.use("/users", userRoutes);
router.use("/slots", slotRoutes);
router.use("/bookings", bookingRoutes);

export default router;
