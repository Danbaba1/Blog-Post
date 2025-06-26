import { PostController } from "./../controllers/post.controller";
import Express from "express";

const router = Express.Router();

router.get("/", PostController.root);

// Get all posts
router.get("/posts", PostController.getPosts);

// Get post by ID
router.get("/post/:id", PostController.getPostById);

// Create post
router.post("/create/post", PostController.createPost);

// Update post (placeholder)
router.put("/post/:id", PostController.updatePost);

// Delete post
router.delete("/post/:id", PostController.deletePost);

export default router;
