import { Request, Response } from "express";
import { PostService } from "../services/posts.service";

export function root(req: Request, res: Response): void {
  res.status(200).json({
    message: "Welcome to the Post API",
  });
}

export function createPost(req: Request, res: Response): void {
  try {
    const {
      title,
      description,
      createdBy,
    }: { title: string; description: string; createdBy: string } = req.body;
    PostService.createPost({ title, description, createdBy });
    res.status(200).json({
      message: "Post created successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}

export function getPosts(req: Request, res: Response): void {
  try {
    const posts = PostService.getPosts();

    res.status(200).json({
      posts: posts,
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
    });
  }
}

export function getPostById(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    let post = PostService.getPostById(id);

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

export function updatePost(req: Request, res: Response): void {
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
    PostService.updatePost(id, { title, description, createdBy });
    res.status(200).json({
      message: "Post updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
    });
  }
}

export function deletePost(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const deleted = PostService.deletePost(id);
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
