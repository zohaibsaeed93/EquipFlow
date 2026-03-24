import { Router } from "express";
import userRoutes from "./user.routes";
import slotRoutes from "./slot.routes";
import bookingRoutes from "./booking.routes";
import equipmentRoutes from "./equipment.routes";
import { equipmentController } from "../controllers/equipment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Mount routes
router.use("/users", userRoutes);
router.use("/slots", slotRoutes);
router.use("/bookings", bookingRoutes);
router.use("/equipment", equipmentRoutes);

// GET /api/certifications
router.get("/certifications", authMiddleware, (req, res) =>
  equipmentController.getAllCertifications(req, res),
);

// GET /api/users/:userId/certifications
router.get("/users/:userId/certifications", authMiddleware, (req, res) =>
  equipmentController.getUserCertifications(req, res),
);

export default router;
