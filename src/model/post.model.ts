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
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isDraft: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
    },
    tags: [
      {
        type: String,
      },
    ],
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Post = model<IPostsDocument>("Posts", postsSchema);
