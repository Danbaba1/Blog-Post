import {
  root,
  getPaginatedPosts,
  getPaginatedMyPosts,
  searchPaginatedPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
} from "./../controllers/post.controller";
import express from "express";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.get("/", root);

// Get all posts
router.get("/posts", getPaginatedPosts);

// Get posts by search
router.get("/posts/search", searchPaginatedPosts);

// Get post by ID
router.get("/post/:id", getPostById);

router.use(authenticateToken);

router.get("/posts/my", getPaginatedMyPosts);

// Create post
router.post("/post", createPost);

// Update post (placeholder)
router.put("/post/:id", updatePost);

// Delete post
router.delete("/post/:id", deletePost);

router.patch("/post/:id/publish", publishPost);
router.patch("/post/:id/unpublish", unpublishPost);

export default router;
