import { Router } from "express";
import { slotController } from "../controllers/slot.controller";
import { authMiddleware, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../entities/User.entity";

const router = Router();

// All slot routes require authentication
router.use(authMiddleware);

// Create a new availability slot
router.post("/", (req, res) => slotController.createSlot(req, res));

// Get all slots (supports ?userId=xxx&available=true)
router.get("/", (req, res) => slotController.getSlots(req, res));

// Get a single slot by ID
router.get("/:id", (req, res) => slotController.getSlotById(req, res));

// Delete a slot
router.delete(
	"/:id",
	authorize(UserRole.ADMIN),
	(req, res) => slotController.deleteSlot(req, res),
);

export default router;
