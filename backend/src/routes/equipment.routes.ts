import { Router } from "express";
import { equipmentController } from "../controllers/equipment.controller";
import { authMiddleware, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../entities/User.entity";

const router = Router();

router.use(authMiddleware);

// GET /api/equipment — any authenticated user
router.get("/", (req, res) => equipmentController.getAll(req, res));

// POST /api/equipment — admin only
router.post("/", authorize(UserRole.ADMIN), (req, res) => equipmentController.create(req, res));

// DELETE /api/equipment/:id — admin only
router.delete("/:id", authorize(UserRole.ADMIN), (req, res) => equipmentController.delete(req, res));

export default router;
