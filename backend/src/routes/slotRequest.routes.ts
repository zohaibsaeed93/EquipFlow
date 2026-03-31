import { Router } from "express";
import { slotRequestController } from "../controllers/slotRequest.controller";
import { authMiddleware, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../entities/User.entity";

const router = Router();

// All slot-request routes require authentication
router.use(authMiddleware);

// Create a slot request (any authenticated user)
router.post("/", (req, res) => slotRequestController.createSlotRequest(req, res));

// Get slot requests (admin: all, user: own)
router.get("/", (req, res) => slotRequestController.getSlotRequests(req, res));

// Approve a slot request (admin only)
router.post(
  "/:id/approve",
  authorize(UserRole.ADMIN),
  (req, res) => slotRequestController.approveSlotRequest(req, res),
);

// Reject a slot request (admin only)
router.post(
  "/:id/reject",
  authorize(UserRole.ADMIN),
  (req, res) => slotRequestController.rejectSlotRequest(req, res),
);

export default router;
