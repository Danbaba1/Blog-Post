import { IProfileInput } from "../types/profile.types";
import { Request, Response } from "express";
import { ProfileService } from "../services/profile.service";
import {
  extractPublicIdFromUrl,
  deleteFromCloudinary,
} from "../middleware/upload.middleware";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

export class ProfileController {
  static async getMyProfile(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
        return;
      }

      const profile = await ProfileService.getUserProfile(userId);

      res.json({
        status: "success",
        data: profile,
      });
    } catch (error: any) {
      console.error("Get profile error:", error);

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

  static async updateMyProfile(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
        return;
      }

      const profileData: IProfileInput = req.body;
      const updatedProfile = await ProfileService.updateUserProfile(
        userId,
        profileData
      );

      res.json({
        status: "success",
        message: "Profile updated successfully",
        data: updatedProfile,
      });
    } catch (error: any) {
      console.error("Update profile error:", error);

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

  static async getPublicProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const profile = await ProfileService.getPublicProfile(userId);

      res.json({
        status: "success",
        data: profile,
      });
    } catch (error: any) {
      console.error("Get public profile error:", error);

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

  static async uploadProfilePicture(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          status: "error",
          message: "No file uploaded. Please select an image file.",
        });
        return;
      }

      const currentUser = await ProfileService.getUserProfile(userId);
      const oldProfilePictureUrl = currentUser.profilePicture;

      let profilePictureUrl: string;

      if (process.env.NODE_ENV === "production") {
        profilePictureUrl = req.file.path;
      } else {
        profilePictureUrl = `/uploads/profiles/${req.file.filename}`;
      }

      const updatedProfile = await ProfileService.updateProfilePicture(
        userId,
        profilePictureUrl,
        oldProfilePictureUrl || undefined
      );

      if (oldProfilePictureUrl && process.env.NODE_ENV === "production") {
        const publicId = extractPublicIdFromUrl(oldProfilePictureUrl);
        if (publicId) {
          deleteFromCloudinary(publicId).catch((err) =>
            console.error("Failed to delete old profile picture:", err)
          );
        }
      }
      res.json({
        status: "success",
        message: "Profile picture uploded successfully",
        data: {
          profilePicture: profilePictureUrl,
          profile: updatedProfile,
        },
      });
    } catch (error: any) {
      console.error("Upload profile picture error:", error);

      if (error.statusCode) {
        res.status(error.statusCode).json({
          status: "error",
          message: "Failed to upload profile picture",
        });
      }
    }
  }

  static async deleteProfilePicture(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
        return;
      }

      const currentUser = await ProfileService.getUserProfile(userId);
      const currentProfilePictureUrl = currentUser.profilePicture;

      if (!currentProfilePictureUrl) {
        res.status(400).json({
          status: "error",
          message: "No profile picture to delete",
        });
        return;
      }

      const updatedProfile = await ProfileService.updateProfilePicture(
        userId,
        ""
      );

      if (process.env.NODE_ENV === "production") {
        const publicId = extractPublicIdFromUrl(currentProfilePictureUrl);
        if (publicId) {
          deleteFromCloudinary(publicId).catch((err) =>
            console.error(
              "Failed to delete profile picture from Cloudinary:",
              err
            )
          );
        }
      }

      res.json({
        status: "success",
        message: "Profile picture deleted seccessfully",
        data: updatedProfile,
      });
    } catch (error: any) {
      console.error("Deleted profile picture error:", error);

      if (error.statusCode) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
      } else {
        res.status(500).json({
          status: "error",
          message: "Failed to delete profile picture",
        });
      }
    }
  }
}
