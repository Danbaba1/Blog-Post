import { Post } from "../model/post.model";
import { User } from "../model/user.model";
import { IPosts, IPostsDocument } from "../types/post.types";
import {
  PaginationOptions,
  PaginatedResponse,
} from "../types/pagination.types";
import { PaginationUtils } from "../utils/pagination.utils";
import mongoose from "mongoose";

class PostService {
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
      const post = await Post.findById(id).populate(
        "createdBy",
        "name email isAuthor"
      );
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

  static async createPost(
    postData: IPosts,
    userId: string
  ): Promise<{ success: boolean; data?: IPostsDocument; error?: string }> {
    if (!postData.title || !postData.description) {
      return {
        success: false,
        error: "Missing required fields: title and description are required",
      };
    }
    try {
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      const post = await Post.create({
        ...postData,
        createdBy: userId,
        isPublished: false,
        isDraft: true,
      });

      if (!user.isAuthor) {
        await User.findByIdAndUpdate(userId, {
          isAuthor: true,
          authorSince: new Date(),
        });
      }
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

  static async publishPost(
    postId: string,
    userId: string
  ): Promise<{ success: boolean; data?: IPostsDocument; error?: string }> {
    try {
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return {
          success: false,
          error: "Invalid post ID format",
        };
      }

      const post = await Post.findOne({ _id: postId, createdBy: userId });
      if (!post) {
        return {
          success: false,
          error: "Post not found or you don't have permission to publish it",
        };
      }

      const publishedPost = await Post.findByIdAndUpdate(
        postId,
        {
          isPublished: true,
          isDraft: false,
          publishedAt: new Date(),
        },
        { new: true }
      ).populate("createdBy", "name email isAuthor");

      if (!publishedPost) {
        return {
          success: false,
          error: "Failed to publish post",
        };
      }
      return {
        success: true,
        data: publishedPost,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async unpublishPost(
    postId: string,
    userId: string
  ): Promise<{ success: boolean; data?: IPostsDocument; error?: string }> {
    try {
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return {
          success: false,
          error: "Invalid post ID format",
        };
      }

      const post = await Post.findOne({ _id: postId, createdBy: userId });
      if (!post) {
        return {
          success: false,
          error: "Post not found or you don't have permission to unpublish it",
        };
      }

      const unpublishedPost = await Post.findByIdAndUpdate(
        postId,
        {
          isPublished: false,
          isDraft: true,
          publishedAt: undefined,
        },
        { new: true }
      ).populate("createdBy", "name email isAuthor");

      if (!unpublishedPost) {
        return {
          success: false,
          error: "Failed to unpublish post",
        };
      }
      return {
        success: true,
        data: unpublishedPost,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async updatePost(
    id: string,
    updatedData: Partial<IPosts>,
    userId: string
  ): Promise<{ success: boolean; data?: IPostsDocument; error?: string }> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid ID format",
        };
      }
      const post = await Post.findOne({ _id: id, createdBy: userId });
      if (!post) {
        return {
          success: false,
          error: "Post not found or you don't have permission to update it",
        };
      }
      const updatedPost = await Post.findByIdAndUpdate(id, updatedData, {
        new: true,
      }).populate("createdBy", "name email isAuthor");

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
    id: string,
    userId: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid ID format",
        };
      }
      const post = await Post.findOne({ _id: id, createdBy: userId });
      if (!post) {
        return {
          success: false,
          error: "Post not found or you don't have permission to delete it",
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

  static async getPaginatedPosts(
    paginationOptions: PaginationOptions,
    publishedOnly: boolean = false
  ): Promise<PaginatedResponse<any>> {
    try {
      const { page, limit, skip } = paginationOptions;

      const filter = publishedOnly ? { isPublished: true } : {};

      console.log("Filter:", filter);
      console.log("Pagination options:", paginationOptions);

      const posts = await Post.find(filter)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      const totalItems = await Post.countDocuments(filter);
      return PaginationUtils.createPaginationResponse(
        posts,
        totalItems,
        page,
        limit
      );
    } catch (error) {
      console.error("Error fetching paginated posts:", error);
      return {
        success: false,
        error: "Failed to fetch posts",
      };
    }
  }

  static async getPaginatedUserPosts(
    userId: string,
    paginationOptions: PaginationOptions,
    publishedOnly: boolean = false
  ): Promise<PaginatedResponse<any>> {
    try {
      const { page, limit, skip } = paginationOptions;
      const filter: any = { createdBy: userId };
      if (publishedOnly) {
        filter.isPublished = true;
      }

      const posts = await Post.find(filter)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const totalItems = await Post.countDocuments(filter);

      return PaginationUtils.createPaginationResponse(
        posts,
        totalItems,
        page,
        limit
      );
    } catch (error) {
      console.error("Error fetching paginated user posts:", error);
      return {
        success: false,
        error: "Failed to fetch user posts",
      };
    }
  }

  static async searchPaginatedPosts(
    searchQuery: string,
    paginationOptions: PaginationOptions,
    publishedOnly: boolean = true
  ): Promise<PaginatedResponse<any>> {
    try {
      const { page, limit, skip } = paginationOptions;
      const filter: any = {
        $or: [
          { title: { $regex: searchQuery, $options: "i" } },
          { description: { $regex: searchQuery, $options: "i" } },
          { tags: { $in: [new RegExp(searchQuery, "i")] } },
        ],
      };
      if (publishedOnly) {
        filter.isPublished = true;
      }
      const posts = await Post.find(filter)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      const totalItems = await Post.countDocuments(filter);
      return PaginationUtils.createPaginationResponse(
        posts,
        totalItems,
        page,
        limit
      );
    } catch (error) {
      console.error("Error searching paginated posts:", error);
      return {
        success: false,
        error: "Failed to search posts",
      };
    }
  }
}

export { PostService };
