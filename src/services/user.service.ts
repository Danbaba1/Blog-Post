import { User } from "../model/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { IUserInput } from "../types/user.types";
import { createCustomError } from "../utils/error";
import { EmailService } from "./email.service";
import crypto from "crypto";

export class UserService {
  // Check if user exists by email
  static async findUserByEmail(email: string) {
    return await User.findOne({ email });
  }

  // Create new user
  static async createUser(userData: {
    name: string;
    email: string;
    password: string;
    verificationToken: string;
    verificationTokenExpires: Date;
  }) {
    return await User.create(userData);
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, config.bcrypt.saltRounds);
  }

  // Compare password
  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT tokenW
  static generateToken(userId: string): string {
    return jwt.sign({ userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      algorithm: "HS256",
    } as any);
  }

  // Generate verification token
  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  // Generate reset token
  static generateResetToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  // Register user with email verification
  static async registerUser(userData: IUserInput) {
    // Check if user already exists
    const existingUser = await this.findUserByEmail(userData.email);
    if (existingUser) {
      throw createCustomError("User already exists", 400);
    }

    // Verify SMTP connection
    const isEmailServiceWorking = await EmailService.verifyConnection();
    if (!isEmailServiceWorking) {
      throw createCustomError(
        "Email service is not available. Please try again later.",
        500
      );
    }

    // Generate verification token and hash password
    const verificationToken = this.generateVerificationToken();
    const hashedPassword = await this.hashPassword(userData.password);

    // Create new user
    const user = await this.createUser({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    try {
      // Send verification email
      await EmailService.sendVerificationEmail(
        userData.email,
        userData.name,
        verificationToken
      );
      return { success: true, user };
    } catch (emailError) {
      // If email fails, mark user as requiring email verification retry
      console.error("Failed to send verification email:", emailError);
      await User.findByIdAndUpdate(user._id, {
        $set: {
          emailVerificationFailed: true,
        },
      });
      return { success: false, user, emailError: true };
    }
  }

  // Authenticate user
  static async authenticateUser(email: string, password: string) {
    // Find user by email
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw createCustomError("Invalid credentials", 401);
    }

    // Check if user is verified
    if (user.isVerified !== true) {
      throw createCustomError("Verify Email", 401);
    }

    // Validate password
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw createCustomError("Invalid credentials", 401);
    }

    // Generate JWT token
    const token = this.generateToken(user._id.toString());

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  }

  // Verify email token
  static async verifyEmailToken(token: string) {
    // Find user by verification token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      throw createCustomError("Invalid or expired verification token", 400);
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return user;
  }

  // Handle forgot password
  static async initiatePasswordReset(email: string) {
    // Find user by email
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw createCustomError("No account found with that email", 404);
    }

    // Verify email service before proceeding
    const isEmailServiceWorking = await EmailService.verifyConnection();
    if (!isEmailServiceWorking) {
      throw createCustomError(
        "Email service is not available. Please try again later.",
        500
      );
    }

    // Generate reset token
    const resetToken = this.generateResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    try {
      // Send password reset email
      await EmailService.sendPasswordResetEmail(email, user.name, resetToken);
      return { success: true };
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);

      // Reset the token since email failed
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      throw createCustomError(
        "Failed to send password reset email. Please try again later.",
        500
      );
    }
  }

  // Reset password with token
  static async resetUserPassword(token: string, newPassword: string) {
    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw createCustomError("Invalid or expired reset token", 400);
    }

    // Hash new password and save
    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return user;
  }

  static async getAllUsers() {
    try {
      const users = await User.find({})
        .select("name email isVerified createdAt")
        .sort({ createdAt: -1 });

      return users;
    } catch (error) {
      throw createCustomError("Failed to retrieve users", 500);
    }
  }

  static async getAuthors() {
    try {
      const authors = await User.find({ isAuthor: true })
        .select("name email isAuthor authorSince createdAt")
        .sort({ authorSince: -1 });

      return authors;
    } catch (error) {
      throw createCustomError("Failed to retrieve authors", 500);
    }
  }

  static async getUserStats() {
    try {
      const totalUsers = await User.countDocuments({});
      const totalAuthors = await User.countDocuments({ isAuthor: true });
      const verifiedUsers = await User.countDocuments({ isVerified: true });

      return {
        totalUsers,
        totalAuthors,
        verifiedUsers,
        regularUsers: totalUsers - totalAuthors,
      };
    } catch (error) {
      throw createCustomError("Failed to retrieve user statistics", 500);
    }
  }
}
