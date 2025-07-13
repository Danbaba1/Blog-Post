import { Document, Types } from "mongoose";

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

export interface IPostsDocument extends IPosts, Document {
  createdAt: Date;
  updatedAt: Date;
}
