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
  // Debug logging
  console.log("🔍 Auth middleware called");
  console.log("🔍 Authorization header:", req.headers.authorization);

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  console.log("🔍 Extracted token:", token);

  if (!token) {
    console.log("❌ No token found");
    res.status(401).json({ message: "Authentication token required" });
    return;
  }

  try {
    console.log(
      "🔍 Verifying token with secret:",
      config.jwt.secret ? "Secret exists" : "No secret"
    );
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
    console.log("✅ Token decoded successfully:", decoded);

    req.userId = decoded.userId;
    req.user = { userId: decoded.userId };
    console.log("✅ User ID set on request:", req.userId);
    next();
  } catch (error) {
    console.log("❌ Token verification failed:", error);
    res.status(403).json({ message: "Invalid or expired token" });
    return;
  }
};
