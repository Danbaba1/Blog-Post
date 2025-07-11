import { Schema, model, Document } from "mongoose";
import Joi from "joi";

export const postSchemaValidate = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  createdBy: Joi.string().required(),
});

export interface IPosts {
  title: string;
  description: string;
  createdBy: string;
}

export interface IPostsDocument extends IPosts, Document {
  createdAt: Date;
  updatedAt: Date;
}

const postsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Post = model<IPostsDocument>("Posts", postsSchema);
