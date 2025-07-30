import { IProfileInput, IUserProfile } from "../types/profile.types";
import { createCustomError } from "../utils/error";
import { User } from "../model/user.model";
import mongoose from "mongoose";

export class ProfileService {
  static async getUserProfile(userId: string): Promise<IUserProfile> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw createCustomError("Invalid user ID format", 400);
      }

      const user = await User.findById(userId).select(
        "-password -resetPasswordToken -resetPasswordExpires -verificationToken -verificationTokenExpires"
      );
      if (!user) {
        throw createCustomError("User not found", 404);
      }
      return user.toObject() as IUserProfile;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw createCustomError("Failed to retrieve user profile", 500);
    }
  }

  static async updateUserProfile(
    userId: string,
    profileData: IProfileInput
  ): Promise<IUserProfile> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw createCustomError("Invlaid user ID format", 400);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw createCustomError("User not found", 404);
      }

      const updateData: any = {};

      if (profileData.bio !== undefined) {
        updateData.bio = profileData.bio;
      }

      if (profileData.profilePicture !== undefined) {
        updateData.profilePicture = profileData.profilePicture;
      }

      if (profileData.socialLinks !== undefined) {
        updateData.socialLinks = {
          X: profileData.socialLinks.X || null,
          linkedin: profileData.socialLinks.linkedin || null,
          website: profileData.socialLinks.website || null,
        };
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select(
        "-password -resetPasswordToken -resetPasswordeExpires -verificationToken -verificationTokenExpires"
      );

      if (!updatedUser) {
        throw createCustomError("Failed to update profile", 500);
      }

      return updatedUser.toObject() as IUserProfile;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw createCustomError("Failed to update user profile", 500);
    }
  }

  static async updateProfilePicture(
    userId: string,
    profilePictureUrl: string,
    oldProfilePictureUrl?: string
  ): Promise<IUserProfile> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw createCustomError("Invalid user ID format", 400);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw createCustomError("User not found", 404);
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { profilePicture: profilePictureUrl } },
        { new: true, runValidators: true }
      ).select(
        "-password -resetPasswordToken -resetPasswordExpires -verificationToken -verificationTokenExpires"
      );

      if (!updatedUser) {
        throw createCustomError("Failed to update profile picture", 500);
      }

      return updatedUser.toObject() as IUserProfile;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw createCustomError("Failed to update profile picture", 500);
    }
  }

  static async getPublicProfile(
    userId: string
  ): Promise<Partial<IUserProfile>> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw createCustomError("Invalid user ID format", 400);
      }

      const user = await User.findById(userId).select(
        "name bio profilePicture socialLinks isAuthor authorSince followerCount followingCount createdAt"
      );

      if (!user) {
        throw createCustomError("User not found", 404);
      }

      return user.toObject();
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw createCustomError("Failed to retrieve public profile", 500);
    }
  }
}
