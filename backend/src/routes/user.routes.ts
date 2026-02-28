import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

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

/**
 * Protected Routes - Authentication required
 */
// Get current user profile
router.get("/me", authMiddleware, (req, res) =>
  userController.getCurrentUser(req, res),
);

// Get all users
router.get("/", authMiddleware, (req, res) =>
  userController.getAllUsers(req, res),
);

// Get user by username
router.get("/username/:username", authMiddleware, (req, res) =>
  userController.getUserByUsername(req, res),
);

// Get user by ID
router.get("/:id", authMiddleware, (req, res) =>
  userController.getUserById(req, res),
);

// Update user
router.put("/:id", authMiddleware, (req, res) =>
  userController.updateUser(req, res),
);

// Update password
router.patch("/:id/password", authMiddleware, (req, res) =>
  userController.updatePassword(req, res),
);

// Soft delete user
router.delete("/:id", authMiddleware, (req, res) =>
  userController.deleteUser(req, res),
);

// Permanently delete user
router.delete("/:id/permanent", authMiddleware, (req, res) =>
  userController.permanentlyDeleteUser(req, res),
);

export default router;
