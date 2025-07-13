import { Request, Response } from "express";
import { PostService } from "../services/posts.service";
import { postSchemaValidate } from "../model/post.model";
import { PaginationQuery } from "../types/pagination.types";
import { PaginationUtils } from "../utils/pagination.utils";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
  userId?: string;
}

export function root(req: Request, res: Response): void {
  res.status(200).json({
    message: "Hello World!",
  });
}

export async function createPost(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const {
      title,
      description,
      tags,
    }: { title: string; description: string; tags: string[] } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        error: "Authenticated required",
      });
      return;
    }

    if (!title || !description) {
      res.status(400).json({
        error: "Missing required fields: title and description are required",
      });
      return;
    }
    const validationResult = postSchemaValidate.validate({
      title,
      description,
      createdBy: userId,
    });

    if (validationResult.error) {
      res.status(400).json({
        error: validationResult.error.details[0].message,
      });
      return;
    }

    const result = await PostService.createPost(
      {
        title,
        description,
        tags,
        createdBy: userId,
      },
      userId
    );
    if (result.success) {
      res.status(201).json({
        message: "Post created successfully as draft",
        post: result.data,
      });
    } else {
      res.status(400).json({
        error: result.error || "Failed to create post",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}

export async function publishPost(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        error: "Authentication required",
      });
      return;
    }

    const result = await PostService.publishPost(id, userId);

    if (result.success) {
      res.status(200).json({
        message: "Post published successfully",
        post: result.data,
      });
    } else {
      res.status(400).json({
        error: result.error || "Failed to publish post",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}

export async function unpublishPost(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        error: "Authentication required",
      });
      return;
    }

    const result = await PostService.unpublishPost(id, userId);

    if (result.success) {
      res.status(200).json({
        message: "Post unpublished successfully",
        post: result.data,
      });
    } else {
      res.status(400).json({
        error: result.error || "Failed to unpublish post",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}

export async function getPostById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const result = await PostService.getPostById(id);

    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(404).json({
        error: result.error || "Post not found",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}

export async function updatePost(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { title, description, tags } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        error: "Authentication required",
      });
      return;
    }
    const existingPost = await PostService.getPostById(id);
    if (!existingPost.success) {
      res.status(404).json({
        message: "Post not found",
        error: existingPost.error,
      });
      return;
    }
    const result = await PostService.updatePost(
      id,
      {
        title,
        description,
        tags,
      },
      userId
    );

    if (result.success) {
      res.status(200).json({
        message: "Post updated successfully",
        post: result.data,
      });
    } else {
      res.status(404).json({
        error: result.error || "Post not found",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}

export async function deletePost(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        error: "Authentication required",
      });
      return;
    }
    const result = await PostService.deletePost(id, userId);
    if (result.success && !result.error) {
      res.status(200).json({
        message: result.message || "Post deleted successfully",
      });
    } else {
      res.status(404).json({
        error: result.error || "Post not found",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}

export async function getPaginatedPosts(
  req: Request<{}, {}, {}, PaginationQuery>,
  res: Response
): Promise<void> {
  try {
    const paginationOptions = PaginationUtils.parsePaginationQuery(req.query);
    const publishedOnly = req.query.published === "true";

    const result = await PostService.getPaginatedPosts(
      paginationOptions,
      publishedOnly
    );

    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(500).json({
        error: result.error || "Failed to fetch posts",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}

export async function getPaginatedMyPosts(
  req: AuthenticatedRequest & { query: PaginationQuery },
  res: Response
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        error: "Authentication required",
      });
      return;
    }
    const paginationOptions = PaginationUtils.parsePaginationQuery(req.query);
    const publishedOnly = req.query.published === "true";

    const result = await PostService.getPaginatedUserPosts(
      userId,
      paginationOptions,
      publishedOnly
    );

    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(500).json({
        error: result.error || "Failed to fetch yur posts",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}

export async function searchPaginatedPosts(
  req: Request<{}, {}, {}, PaginationQuery & { q: string }>,
  res: Response
): Promise<void> {
  try {
    const { q: searchQuery } = req.query;

    if (!searchQuery) {
      res.status(400).json({
        error: "Search query is required",
      });
      return;
    }
    const paginationOptions = PaginationUtils.parsePaginationQuery(req.query);
    const publishedOnly = req.query.published !== "false";

    const result = await PostService.searchPaginatedPosts(
      searchQuery,
      paginationOptions,
      publishedOnly
    );

    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(500).json({
        error: result.error || "Failed to search posts",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}
