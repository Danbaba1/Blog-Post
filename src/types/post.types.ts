import { Document } from "mongoose";

export interface IPosts {
  title: string;
  description: string;
  createdBy: string;
}

export interface IPostsDocument extends IPosts, Document {
  createdAt: Date;
  updatedAt: Date;
}
