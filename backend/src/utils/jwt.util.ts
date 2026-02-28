import jwt, { SignOptions } from "jsonwebtoken";
import { configService } from "../../config/config.service";

export interface JwtPayload {
  userId: string;
  username: string;
}

export class JwtService {
  /**
   * Generate JWT token
   */
  static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, configService.jwtSecret, {
      expiresIn: configService.jwtExpiresIn,
    } as SignOptions);
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, configService.jwtSecret) as JwtPayload;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * Decode JWT token without verification (for debugging)
   */
  static decodeToken(token: string): any {
    return jwt.decode(token);
  }
}
