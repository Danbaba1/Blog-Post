import { Post } from "../model/schema";

class PostService {
  private post: typeof Post;
  private id: string;

  constructor(post: typeof Post, id: string) {
    this.post = post;
    this.id = id;
  }

  static async getPostById(id: string): Promise<any> {
    try {
      const post = await Post.findById({ _id: id });
      return post;
    } catch (error) {
      console.error("Error reading posts:", error);
      return {
        status: "Failed",
        message: error,
      };
    }
  }

  static async getPosts(): Promise<any> {
    try {
      const posts = await Post.find({});
      return posts;
    } catch (error) {
      return {
        status: "Failed",
        message: error,
      };
    }
  }

  static async createPost({
    title,
    description,
    createdBy,
  }: {
    title: string;
    description: string;
    createdBy: string;
  }): Promise<any> {
    if (!title || !description || !createdBy) {
      throw new Error("Missing required fields please fill correctly");
    }
    try {
      const newPost = await Post.create({ title, description, createdBy });
      console.log("Post created successfully:", newPost);
      return newPost;
    } catch (error) {
      console.error("Failed to delete post: ", error);
      throw new Error("Failed to create post");
    }
  }

  static async updatePost(
    id: string,
    {
      title,
      description,
      createdBy,
    }: { title?: string; description?: string; createdBy?: string }
  ): Promise<any> {
    try {
      const post = await Post.findByIdAndUpdate(
        { _id: id },
        { title, description, createdBy },
        { new: true }
      );

      if (!post) {
        return {
          status: "Failed",
          message: "Post not available",
        };
      }
      return {
        status: "Success",
        post: post,
      };
    } catch (error) {
      return {
        status: "Failed",
        message: error,
      };
    }
  }

  static async deletePost(id: string): Promise<any> {
    try {
      const post = await Post.findByIdAndDelete({ _id: id });
      if (!post) {
        return {
          status: "Failed",
          message: "Post no available",
        };
      } else {
        return {
          status: "Success",
          message: post,
        };
      }
    } catch (error) {
      console.error("Failed to delete post: ", error);
      throw new Error("Failed to delete post");
    }
  }
}

export { PostService };
