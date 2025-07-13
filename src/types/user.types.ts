export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  isVerified: Boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  emailVerificationFailed?: boolean;
  isAuthor?: boolean;
  bio?: string;
  profilePicture?: string;
  socialLinks?: {
    X?: string;
    linkedin?: string;
    website?: string;
  };
  authorSince?: Date;
  followerCount?: number;
  followingCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserInput {
  name: string;
  email: string;
  password: string;
}
