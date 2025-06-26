import { Request, Response } from "express";
import {
  getPostById,
  getPosts,
  createPost,
  updatePost,
  deletePost,
} from "../services/posts.service";

export class PostController {
  constructor() {}

  static root(req: Request, res: Response) {
    res.status(200).json({
      message: "Welcome to the Post API",
    });
  }

  static createPost(req: Request, res: Response) {
    try {
      const {
        title,
        description,
        createdBy,
      }: { title: string; description: string; createdBy: string } = req.body;
      createPost({ title, description, createdBy });
      res.status(200).json({
        message: "Post created successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  static getPosts(req: Request, res: Response) {
    try {
      const posts = getPosts();

      res.status(200).json({
        posts: posts,
      });
    } catch (error) {
      res.status(500).json({
        error: "Server error",
      });
    }
  }

  static getPostById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      let post = getPostById(id);
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

  static updatePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, createdBy } = req.body;
      updatePost(id, { title, description, createdBy });
      res.status(200).json({
        message: "Post updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: "Server error",
      });
    }
  }

  static deletePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      deletePost(id);
      res.status(200).json({
        message: "Post deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: "Server error",
      });
    }
  }
}
