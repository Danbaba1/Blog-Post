import { Post } from "../model/post.model";
import { User } from "../model/user.model";
import {
  IPosts,
  IPostsDocument,
  IPostWithUserDetails,
} from "../types/post.types";
import {
  PaginationOptions,
  PaginatedResponse,
} from "../types/pagination.types";
import { PaginationUtils } from "../utils/pagination.utils";
import mongoose from "mongoose";

class PostService {
  // Helper method to create user lookup pipeline with proper default values
  private static getUserLookupPipeline() {
    return {
      $lookup: {
        from: "users",
        let: { authorId: "$createdBy" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$authorId"] },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              // Use $ifNull to provide default values for missing fields
              isAuthor: { $ifNull: ["$isAuthor", false] },
              bio: { $ifNull: ["$bio", null] },
              profilePicture: { $ifNull: ["$profilePicture", null] },
              socialLinks: {
                X: { $ifNull: ["$socialLinks.X", null] },
                linkedin: { $ifNull: ["$socialLinks.linkedin", null] },
                website: { $ifNull: ["$socialLinks.website", null] },
              },
              authorSince: { $ifNull: ["$authorSince", null] },
              followerCount: { $ifNull: ["$followerCount", 0] },
              followingCount: { $ifNull: ["$followingCount", 0] },
            },
          },
        ],
        as: "createdBy",
      },
    };
  }

  static async getPostById(id: string): Promise<{
    success: boolean;
    data?: IPostWithUserDetails;
    error?: string;
  }> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid ID format",
        };
      }

      const post = await Post.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        PostService.getUserLookupPipeline(),
        {
          $unwind: "$createdBy",
        },
      ]);

      if (!post || post.length === 0) {
        return {
          success: false,
          error: "Post not found",
        };
      }

      return {
        success: true,
        data: post[0],
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

      // Update user to be an author if they aren't already
      if (!user.isAuthor) {
        await User.findByIdAndUpdate(userId, {
          $set: {
            isAuthor: true,
            authorSince: new Date(),
          },
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
  ): Promise<{
    success: boolean;
    data?: IPostWithUserDetails;
    error?: string;
  }> {
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

      await Post.findByIdAndUpdate(postId, {
        $set: {
          isPublished: true,
          isDraft: false,
          publishedAt: new Date(),
        },
      });

      // Get the updated post with full user details using aggregation
      const publishedPost = await Post.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(postId),
          },
        },
        PostService.getUserLookupPipeline(),
        {
          $unwind: "$createdBy",
        },
      ]);

      if (!publishedPost || publishedPost.length === 0) {
        return {
          success: false,
          error: "Failed to publish post",
        };
      }

      return {
        success: true,
        data: publishedPost[0],
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
  ): Promise<{
    success: boolean;
    data?: IPostWithUserDetails;
    error?: string;
  }> {
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

      await Post.findByIdAndUpdate(postId, {
        $set: {
          isPublished: false,
          isDraft: true,
        },
        $unset: {
          publishedAt: 1,
        },
      });

      // Get the updated post with full user details using aggregation
      const unpublishedPost = await Post.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(postId),
          },
        },
        PostService.getUserLookupPipeline(),
        {
          $unwind: "$createdBy",
        },
      ]);

      if (!unpublishedPost || unpublishedPost.length === 0) {
        return {
          success: false,
          error: "Failed to unpublish post",
        };
      }

      return {
        success: true,
        data: unpublishedPost[0],
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
  ): Promise<{
    success: boolean;
    data?: IPostWithUserDetails;
    error?: string;
  }> {
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

      await Post.findByIdAndUpdate(id, { $set: updatedData });

      // Get the updated post with full user details using aggregation
      const updatedPost = await Post.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        PostService.getUserLookupPipeline(),
        {
          $unwind: "$createdBy",
        },
      ]);

      if (!updatedPost || updatedPost.length === 0) {
        return {
          success: false,
          error: "Post not found",
        };
      }

      return {
        success: true,
        data: updatedPost[0],
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
  ): Promise<PaginatedResponse<IPostWithUserDetails>> {
    try {
      const { page, limit, skip } = paginationOptions;

      // Build match condition
      const matchCondition: any = {};
      if (publishedOnly) {
        matchCondition.isPublished = true;
      }

      console.log("Filter:", matchCondition);
      console.log("Pagination options:", paginationOptions);

      const pipeline: mongoose.PipelineStage[] = [
        {
          $match: matchCondition,
        },
        PostService.getUserLookupPipeline(),
        {
          $unwind: "$createdBy",
        },
        {
          $sort: { createdAt: -1 },
        },
      ];

      // Get total count
      const totalCountPipeline: mongoose.PipelineStage[] = [...pipeline];
      totalCountPipeline.push({ $count: "total" });
      const totalResult = await Post.aggregate(totalCountPipeline);
      const totalItems = totalResult.length > 0 ? totalResult[0].total : 0;

      // Add pagination
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      const posts = await Post.aggregate(pipeline);

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
  ): Promise<PaginatedResponse<IPostWithUserDetails>> {
    try {
      const { page, limit, skip } = paginationOptions;

      // Build match condition
      const matchCondition: any = {
        createdBy: new mongoose.Types.ObjectId(userId),
      };
      if (publishedOnly) {
        matchCondition.isPublished = true;
      }

      const pipeline: mongoose.PipelineStage[] = [
        {
          $match: matchCondition,
        },
        PostService.getUserLookupPipeline(),
        {
          $unwind: "$createdBy",
        },
        {
          $sort: { createdAt: -1 },
        },
      ];

      // Get total count
      const totalCountPipeline: mongoose.PipelineStage[] = [...pipeline];
      totalCountPipeline.push({ $count: "total" });
      const totalResult = await Post.aggregate(totalCountPipeline);
      const totalItems = totalResult.length > 0 ? totalResult[0].total : 0;

      // Add pagination
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      const posts = await Post.aggregate(pipeline);

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
  ): Promise<PaginatedResponse<IPostWithUserDetails>> {
    try {
      const { page, limit, skip } = paginationOptions;

      // Build match condition with search
      const matchCondition: any = {
        $and: [
          {
            $or: [
              { title: { $regex: searchQuery, $options: "i" } },
              { description: { $regex: searchQuery, $options: "i" } },
              { tags: { $in: [new RegExp(searchQuery, "i")] } },
            ],
          },
        ],
      };

      if (publishedOnly) {
        matchCondition.$and.push({ isPublished: true });
      }

      const pipeline: mongoose.PipelineStage[] = [
        {
          $match: matchCondition,
        },
        PostService.getUserLookupPipeline(),
        {
          $unwind: "$createdBy",
        },
        {
          $sort: { createdAt: -1 },
        },
      ];

      // Get total count
      const totalCountPipeline: mongoose.PipelineStage[] = [...pipeline];
      totalCountPipeline.push({ $count: "total" });
      const totalResult = await Post.aggregate(totalCountPipeline);
      const totalItems = totalResult.length > 0 ? totalResult[0].total : 0;

      // Add pagination
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      const posts = await Post.aggregate(pipeline);

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
