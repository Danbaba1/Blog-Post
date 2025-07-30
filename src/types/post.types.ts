import { Document, Types } from "mongoose";

// User details interface for populated createdBy field
export interface IUserDetails {
  _id: string | Types.ObjectId;
  name: string;
  email: string;
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
}

// Base post interface (as stored in database)
export interface IPosts {
  title: string;
  description: string;
  createdBy: Types.ObjectId | string;
  isPublished?: boolean;
  isDraft?: boolean;
  publishedAt?: Date;
  tags?: string[];
  likes?: number;
  views?: number;
}

// Post document interface (extends base with mongoose Document)
export interface IPostsDocument extends IPosts, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Post with populated user details (for API responses)
export interface IPostWithUserDetails extends Omit<IPosts, "createdBy"> {
  _id: string | Types.ObjectId;
  createdBy: IUserDetails;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

// Service response interface
export interface IPostServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
