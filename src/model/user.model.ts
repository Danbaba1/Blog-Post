import mongoose, { Schema } from "mongoose";
import { IUser } from "../types/user.types";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    emailVerificationFailed: {
      type: Boolean,
      default: false,
    },
    isAuthor: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    profilePicture: {
      type: String,
    },
    socialLinks: {
      X: String,
      linkedin: String,
      website: String,
    },
    authorSince: {
      type: Date,
    },
    followerCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", userSchema);
