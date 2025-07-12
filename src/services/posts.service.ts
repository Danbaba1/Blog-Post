import { Post } from "../model/post.model";
import { IPosts, IPostsDocument } from "../types/post.types";
import mongoose from "mongoose";

class PostService {
  private post: typeof Post;
  private id: string;

  constructor(post: typeof Post, id: string) {
    this.post = post;
    this.id = id;
  }

  static async getPostById(
    id: string
  ): Promise<{ success: boolean; data?: IPostsDocument; error?: string }> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid ID format",
        };
      }
      const post = await Post.findById(id);
      if (!post) {
        return {
          success: false,
          error: "Post not found",
        };
      }
      return {
        success: true,
        data: post,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async getPosts(): Promise<{
    success: boolean;
    data?: IPostsDocument[];
    error?: string;
  }> {
    try {
      const posts = await Post.find({});
      return {
        success: true,
        data: posts,
      };
    } catch (error: any) {
      return {
        success: false,
        error: "Failed to retrieve posts",
      };
    }
  }

  static async createPost(
    postData: IPosts
  ): Promise<{ success: boolean; data?: IPostsDocument; error?: string }> {
    if (!postData.title || !postData.description || !postData.createdBy) {
      return {
        success: false,
        error: "Missing required fields please fill correctly",
      };
    }
    try {
      const post = await Post.create(postData);
      return {
        success: true,
        data: post,
      };
    } catch (error: any) {
      return {
        success: false,
        error: "Failed to create post",
      };
    }
  }

  static async updatePost(
    id: string,
    updatedData: Partial<IPosts>
  ): Promise<{ success: boolean; data?: IPostsDocument; error?: string }> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid ID format",
        };
      }
      const updatedPost = await Post.findByIdAndUpdate(id, updatedData, {
        new: true,
      });

      if (!updatedPost) {
        return {
          success: false,
          error: "Post not found",
        };
      }
      return {
        success: true,
        data: updatedPost,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async deletePost(
    id: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid ID format",
        };
      }
      const deletedPost = await Post.findByIdAndDelete({ _id: id });
      if (!deletedPost) {
        return {
          success: false,
          error: "Post not found",
        };
      }
      return {
        success: true,
        message: "Post deleted successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export { PostService };
