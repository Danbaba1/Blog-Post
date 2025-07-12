import { Request, Response } from "express";
import { PostService } from "../services/posts.service";
import { postSchemaValidate } from "../model/post.model";

export function root(req: Request, res: Response): void {
  res.status(200).json({
    message: "Hello World!",
  });
}

export async function createPost(req: Request, res: Response): Promise<void> {
  try {
    const {
      title,
      description,
      createdBy,
    }: { title: string; description: string; createdBy: string } = req.body;

    if (!title || !description || !createdBy) {
      res.status(400).json({
        error:
          "Missing required fields: title, description and createdBy are required",
      });
      return;
    }
    const validationResult = postSchemaValidate.validate({
      title,
      description,
      createdBy,
    });
    if (validationResult.error) {
      res.status(400).json({
        error: validationResult.error.details[0].message,
      });
      return;
    }
    const result = await PostService.createPost({
      title,
      description,
      createdBy,
    });
    if (result.success) {
      res.status(201).json({
        message: "Post created successfully",
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

export async function getPosts(req: Request, res: Response): Promise<void> {
  try {
    const result = await PostService.getPosts();

    if (result.success) {
      res.status(200).json({
        posts: result.data || [],
      });
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

export async function updatePost(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { title, description, createdBy } = req.body;
    const existingPost = await PostService.getPostById(id);
    if (!existingPost.success) {
      res.status(404).json({
        message: "Post not found",
        error: existingPost.error,
      });
      return;
    }
    const result = await PostService.updatePost(id, {
      title,
      description,
      createdBy,
    });

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

export async function deletePost(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const result = await PostService.deletePost(id);
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
