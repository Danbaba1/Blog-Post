import { Request, Response } from "express";
import { IUserInput } from "../types/user.types";
import { UserService } from "../services/user.service";

export class UserController {
  // User signup method
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      const userData: IUserInput = req.body;
      const result = await UserService.registerUser(userData);

      if (result.success) {
        res.status(201).json({
          status: "success",
          message:
            "Registration successful. Please check your email to verify your account.",
        });
      } else {
        res.status(201).json({
          status: "warning",
          message:
            "Account created but verification email could not be sent. Please contact support.",
          userId: result.user._id,
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);

      if (error.statusCode) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
      } else {
        res.status(500).json({
          status: "error",
          message: "Internal server error",
        });
      }
    }
  }

  // User login method
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await UserService.authenticateUser(email, password);

      res.json({
        status: "success",
        data: result,
      });
    } catch (error: any) {
      console.error("Login error:", error);

      if (error.statusCode) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
      } else {
        res.status(500).json({
          status: "error",
          message: "Internal server error",
        });
      }
    }
  }

  // Email verification method
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      await UserService.verifyEmailToken(token);

      res.json({
        status: "success",
        message: "Email verified successfully",
      });
    } catch (error: any) {
      console.error("Email verification error:", error);

      if (error.statusCode) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
      } else {
        res.status(500).json({
          status: "error",
          message: "Internal server error",
        });
      }
    }
  }

  // Forgot password method
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      await UserService.initiatePasswordReset(email);

      res.json({
        status: "success",
        message: "Password reset instructions sent to your email",
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);

      if (error.statusCode) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
      } else {
        res.status(500).json({
          status: "error",
          message: "Internal server error",
        });
      }
    }
  }

  // Reset password method
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      const { password } = req.body;

      await UserService.resetUserPassword(token, password);

      res.json({
        status: "success",
        message: "Password reset successfully",
      });
    } catch (error: any) {
      console.error("Reset password error:", error);

      if (error.statusCode) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
      } else {
        res.status(500).json({
          status: "error",
          message: "Internal server error",
        });
      }
    }
  }
}
