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
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserInput {
  name: string;
  email: string;
  password: string;
}
