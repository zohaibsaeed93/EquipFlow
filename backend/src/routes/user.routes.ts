import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authMiddleware, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../entities/User.entity";

const router = Router();

/**
 * Public Routes - No authentication required
 */
// Login
router.post("/login", (req, res) => userController.login(req, res));

// Logout
router.post("/logout", (req, res) => userController.logout(req, res));

// Create user (public registration)
router.post("/", (req, res) => userController.createUser(req, res));

// Admin/Manager create user with role assignment
router.post(
  "/admin",
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  (req, res) => userController.adminCreateUser(req, res),
);

/**
 * Protected Routes - Authentication required
 */
// Get current user profile (any authenticated user)
router.get("/me", authMiddleware, (req, res) =>
  userController.getCurrentUser(req, res),
);

// Get all users (admin and manager only)
router.get(
  "/",
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  (req, res) => userController.getAllUsers(req, res),
);

// Get user by username (admin and manager only)
router.get(
  "/username/:username",
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  (req, res) => userController.getUserByUsername(req, res),
);

// Get user by ID (admin and manager only)
router.get(
  "/:id",
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  (req, res) => userController.getUserById(req, res),
);

// Update user (admin and manager only)
router.put(
  "/:id",
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  (req, res) => userController.updateUser(req, res),
);

// Update password (admin only, or own password via /me — handled in controller)
router.patch(
  "/:id/password",
  authMiddleware,
  authorize(UserRole.ADMIN),
  (req, res) => userController.updatePassword(req, res),
);

// Soft delete user (admin only)
router.delete("/:id", authMiddleware, authorize(UserRole.ADMIN), (req, res) =>
  userController.deleteUser(req, res),
);

// Permanently delete user (admin only)
router.delete(
  "/:id/permanent",
  authMiddleware,
  authorize(UserRole.ADMIN),
  (req, res) => userController.permanentlyDeleteUser(req, res),
);

export default router;
