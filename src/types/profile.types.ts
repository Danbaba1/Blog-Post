export interface IProfileInput {
  bio?: string;
  profilePicture?: string;
  socialLinks?: {
    X?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface IUserProfile {
  _id: string;
  name: string;
  email: string;
  isAuthor: boolean;
  bio?: string;
  profilePicture?: string;
  socialLinks?: {
    X?: string;
    linkedin?: string;
    website?: string;
  };
  authorSince?: Date;
  followerCount: number;
  followingCount: number;
  createdAt: Date;
  updatedAt: Date;
}
