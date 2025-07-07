import { Request, Response } from "express";
import { PostService } from "../services/posts.service";
import { postSchemaValidate } from "../model/schema";

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
    if (!postSchemaValidate.validate({ title, description, createdBy })) {
      res.status(400).json({
        error:
          "Missing required fields: title, description, and createdBy are required",
      });
      return;
    }
    const newPost = await PostService.createPost({
      title,
      description,
      createdBy,
    });
    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      error: "Server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getPosts(req: Request, res: Response): Promise<void> {
  try {
    const posts = await PostService.getPosts();
    if (!posts) {
      res.status(400).json({
        message: "No posts found",
      });
    }

    res.status(200).json({
      posts: posts,
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
    });
  }
}

export async function getPostById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    let post = await PostService.getPostById(id);

    if (!post) {
      res.status(404).json({
        message: "Post not found",
        error: `No post found with id: ${id}`,
      });
      return;
    }

    res.status(200).json({
      message: "Post gotten successfully",
      post: post,
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
    });
  }
}

export async function updatePost(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { title, description, createdBy } = req.body;
    const existingPost = PostService.getPostById(id);
    if (!existingPost) {
      res.status(404).json({
        message: "Post not found",
        error: `No post found with id: ${id}`,
      });
      return;
    }
    await PostService.updatePost(id, { title, description, createdBy });
    res.status(200).json({
      message: "Post updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
    });
  }
}

export async function deletePost(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await PostService.deletePost(id);
    if (!deleted) {
      res.status(404).json({
        message: "Post not found",
        error: `No post found with id: ${id}`,
      });
      return;
    }
    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
    });
  }
}
