import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    userId: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    console.log("❌ No token found");
    res.status(401).json({ message: "Authentication token required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };

    req.userId = decoded.userId;
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
    return;
  }
};
