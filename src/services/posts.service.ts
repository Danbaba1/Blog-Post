import fs from "fs";
import path from "path";
import { Post } from "../models/post.interface";

class PostService {
  private post: Post;
  private id: string;

  constructor(post: Post, id: string) {
    this.post = post;
    this.id = id;
  }

  static getPostById(id: string): Post | null {
    try {
      const filePath = path.join("src", "data", "posts.json");
      const data = fs.readFileSync(filePath, "utf8");
      const posts: Post[] = JSON.parse(data);
      return posts.find((post) => post.id === id) || null;
    } catch (error) {
      console.error("Error reading posts:", error);
      return null;
    }
  }

  savePost({
    title,
    description,
    createdBy,
  }: {
    title: string;
    description: string;
    createdBy: string;
  }) {
    const filePath = path.join("src", "data", "posts.json");

    if (!fs.existsSync(filePath)) {
      throw new Error(`Data json file does not exist at ${filePath}`);
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    let posts = [];
    try {
      posts = JSON.parse(rawData);
      if (!Array.isArray(posts)) {
        throw new Error("Failed to parse");
      }
    } catch (error) {
      console.error("Failed to parse", error);
      return;
    }
    const now = new Date();
    const newPost = {
      id: PostService.generateId(),
      title,
      description,
      createdAT: now,
      modifiedAT: now,
      createdBy,
    };
    posts.push(newPost);
    fs.writeFileSync(filePath, JSON.stringify(posts, null, 2), "utf-8");

    return newPost;
  }

  static getPosts(): Post[] {
    const filePath = path.join("src", "data", "posts.json");
    const jsonData = fs.readFileSync(filePath, "utf8");
    const postData = JSON.parse(jsonData);
    return postData;
  }

  static createPost({
    title,
    description,
    createdBy,
  }: {
    title: string;
    description: string;
    createdBy: string;
  }): void {
    if (!title || !description || !createdBy) {
      throw new Error("Missing required fields please fill correctly");
    }

    const dirPath = path.join("src", "data");
    const filePath = path.join(dirPath, "posts.json");

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
    }

    let posts;
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      posts = JSON.parse(raw);
      if (!Array.isArray(posts)) throw new Error();
    } catch (error) {
      console.error("Failed to read or parse");
    }

    const now = new Date();

    const newPost = {
      id: PostService.generateId(),
      title,
      description,
      createdAT: now,
      modifiedAT: now,
      createdBy,
    };

    posts.push(newPost);
    fs.writeFileSync(filePath, JSON.stringify(posts, null, 2), "utf-8");
  }

  static updatePost(
    id: string,
    {
      title,
      description,
      createdBy,
    }: { title?: string; description?: string; createdBy?: string }
  ): boolean {
    const dirPath = path.join("src", "data");
    const filePath = path.join(dirPath, "posts.json");
    let posts = fs.readFileSync(filePath, "utf8");
    const parsedData: Post[] = JSON.parse(posts);
    const post: Post | null = this.getPostById(id);
    if (!post) {
      return false;
    }
    const updatePost = { ...post };
    updatePost.id = id;
    if (title !== undefined) updatePost.title = title;
    if (description !== undefined) updatePost.description = description;
    if (createdBy !== undefined) updatePost.createdBy = createdBy;

    updatePost.modifiedAT = new Date().toISOString();
    let newPosts = parsedData.filter((post) => post.id !== id);
    newPosts.push(updatePost);
    fs.writeFileSync(filePath, JSON.stringify(newPosts, null, 2), "utf8");
    return true;
  }

  static deletePost(id: string): boolean {
    const postId = this.getPostById(id);
    if (!postId) {
      return false;
    }
    const dirPath = path.join("src", "data");
    const filePath = path.join(dirPath, "posts.json");
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const posts = JSON.parse(raw);
      if (!Array.isArray(posts)) throw new Error("Invalid posts data");
      const newPosts = posts.filter((post) => post.id !== id);
      fs.writeFileSync(filePath, JSON.stringify(newPosts, null, 2), "utf8");
      return true;
    } catch (error) {
      console.error("Failed to delete post: ", error);
      throw new Error("Failed to delete post");
    }
  }

  static generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

export { PostService };
