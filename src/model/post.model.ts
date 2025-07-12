import { Schema, model } from "mongoose";
import { IPostsDocument } from "../types/post.types";
import Joi from "joi";

export const postSchemaValidate = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  createdBy: Joi.string().required(),
});

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
