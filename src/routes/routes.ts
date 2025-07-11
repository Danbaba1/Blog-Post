import {
  root,
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "./../controllers/post.controller";
import express from "express";

const router = express.Router();

router.get("/", root);

// Get all posts
router.get("/posts", getPosts);

// Get post by ID
router.get("/post/:id", getPostById);

// Create post
router.post("/post", createPost);

// Update post (placeholder)
router.put("/post/:id", updatePost);

// Delete post
router.delete("/post/:id", deletePost);

export default router;
