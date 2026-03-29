import { Request, Response } from "express";
import { userService } from "../services/user.service";
import { JwtService } from "../utils/jwt.util";
import { configService } from "../../config/config.service";
import { UserRole } from "../entities/User.entity";

const VALID_ROLES = Object.values(UserRole);

export class UserController {
  /**
   * Public registration — always creates a "user" role
   * POST /api/users
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, name, password, email } = req.body;

      if (!username || !name || !password) {
        res.status(400).json({
          error: "Missing required fields",
          required: ["username", "name", "password"],
        });
        return;
      }

      const user = await userService.createUser({
        username,
        name,
        password,
        email,
      });

      const { password: _, ...userResponse } = user;

      res.status(201).json({
        message: "User created successfully",
        data: userResponse,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create user" });
      }
    }
  }

  /**
   * Admin/Manager create user — can assign a role
   * POST /api/users/admin
   */
  async adminCreateUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, name, password, email, role } = req.body;

      if (!username || !name || !password) {
        res.status(400).json({
          error: "Missing required fields",
          required: ["username", "name", "password"],
        });
        return;
      }

      if (role && !VALID_ROLES.includes(role)) {
        res.status(400).json({
          error: "Invalid role",
          allowed: VALID_ROLES,
        });
        return;
      }

      const user = await userService.createUser({
        username,
        name,
        password,
        email,
        role,
      });

      const { password: _, ...userResponse } = user;

      res.status(201).json({
        message: "User created successfully",
        data: userResponse,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create user" });
      }
    }
  }

  /**
   * Get all users
   * GET /api/users
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const isActive =
        req.query.isActive === "false"
          ? false
          : req.query.isActive === "true"
            ? true
            : undefined;

      const skip = (page - 1) * limit;

      const { users, total } = await userService.getAllUsers({
        skip,
        take: limit,
        isActive,
      });

      res.status(200).json({
        data: users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await userService.getUserById(id as string);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({ data: user });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }

  /**
   * Get user by username
   * GET /api/users/username/:username
   */
  async getUserByUsername(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.params;

      const user = await userService.getUserByUsername(username as string);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({ data: user });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }

  /**
   * Update user
   * PUT /api/users/:id
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, username, isActive } = req.body;

      const user = await userService.updateUser(id as string, {
        name,
        email,
        username,
        isActive,
      });

      res.status(200).json({
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to update user" });
      }
    }
  }

  /**
   * Update user password
   * PATCH /api/users/:id/password
   */
  async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { password } = req.body;

      if (!password) {
        res.status(400).json({ error: "Password is required" });
        return;
      }

      await userService.updatePassword(id as string, password);

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to update password" });
      }
    }
  }

  /**
   * Delete user (soft delete)
   * DELETE /api/users/:id
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await userService.deleteUser(id as string);

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to delete user" });
      }
    }
  }

  /**
   * Permanently delete user
   * DELETE /api/users/:id/permanent
   */
  async permanentlyDeleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await userService.permanentlyDeleteUser(id as string);

      res.status(200).json({ message: "User permanently deleted" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to delete user" });
      }
    }
  }

  /**
   * Login user (verify credentials)
   * POST /api/users/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({
          error: "Missing required fields",
          required: ["username", "password"],
        });
        return;
      }

      const user = await userService.verifyCredentials(username, password);

      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Generate JWT token
      const token = JwtService.generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      // Set httpOnly cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: configService.isProduction, // Use secure cookies in production
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        message: "Login successful",
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  }

  /**
   * Get current user profile
   * GET /api/users/me
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const user = await userService.getUserById(req.user.userId);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({ data: user });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  }

  /**
   * Logout user
   * POST /api/users/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Clear the httpOnly cookie
      res.clearCookie("token", {
        httpOnly: true,
        secure: configService.isProduction,
        sameSite: "lax",
      });

      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      res.status(500).json({ error: "Logout failed" });
    }
  }
}

export const userController = new UserController();
