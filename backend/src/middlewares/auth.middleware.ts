import { Request, Response, NextFunction } from "express";
import { JwtService } from "../utils/jwt.util";
import { UserRole } from "../entities/User.entity";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
        role: UserRole;
      };
    }
  }
}

/**
 * Middleware to authenticate JWT token
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    // Get token from cookie
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    // Verify token
    const payload = JwtService.verifyToken(token);

    // Attach user info to request
    req.user = {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(401).json({ error: "Authentication failed" });
    }
  }
};

/**
 * Authorization middleware factory — restricts access to specific roles.
 * Must be used after authMiddleware.
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden: insufficient permissions" });
      return;
    }

    next();
  };
};

/**
 * Optional auth middleware - doesn't fail if no token
 */
export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token = req.cookies?.token;

    if (token) {
      const payload = JwtService.verifyToken(token);
      req.user = {
        userId: payload.userId,
        username: payload.username,
        role: payload.role,
      };
    }

    next();
  } catch (error) {
    // Continue even if token is invalid for optional auth
    next();
  }
};
