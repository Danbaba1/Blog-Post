import { Schema, model } from "mongoose";
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

const postsSchema = new Schema<IPosts>(
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

export const Post = model<IPosts>("Posts", postsSchema);
