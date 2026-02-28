import { Request, Response, NextFunction } from "express";
import { JwtService } from "../utils/jwt.util";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
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
      };
    }

    next();
  } catch (error) {
    // Continue even if token is invalid for optional auth
    next();
  }
};
