import fs from "fs";
import path from "path";
import { Post } from "../models/post.interface";

export function getPostById(id: string): Post | null {
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

// console.log(getPostById("7slcctbybhs")); // Example usage, replace with a valid ID

export function savePost({
  title,
  description,
  createdBy,
}: {
  title: string;
  description: string;
  createdBy: string;
}) {
  console.log("Saving post...");
  const filePath = path.join("src", "data", "posts.json");

  if (!fs.existsSync(filePath)) {
    throw new Error(`Data json file does not exist at ${filePath}`);
  }

  const rawData = fs.readFileSync(filePath, "utf-8");
  let posts = [];
  try {
    console.log("Loading...");
    posts = JSON.parse(rawData);
    if (!Array.isArray(posts)) {
      throw new Error("Failed to parse");
    }
    console.log("Done...");
  } catch (error) {
    console.error("Failed to parse", error);
    return;
  }
  const now = new Date();
  console.log("Coming...");
  const newPost = {
    id: generateId(),
    title,
    description,
    createdAT: now,
    modifiedAT: now,
    createdBy,
  };
  console.log("Creating...");
  posts.push(newPost);
  fs.writeFileSync(filePath, JSON.stringify(posts, null, 2), "utf-8");

  console.log("Post saved successfully");

  return newPost;
}
// savePost({
//   title: "Sample Post",
//   description: "This is a sample post description.",
//   createdBy: "Anonymous",
// });

export const getPosts = (): Post[] => {
  const filePath = path.join("src", "data", "posts.json");
  const jsonData = fs.readFileSync(filePath, "utf8");
  console.log(jsonData);
  const postData = JSON.parse(jsonData);
  console.log(postData);
  return postData;
};

// getPosts();

export function createPost({
  title,
  description,
  createdBy,
}: {
  title: string;
  description: string;
  createdBy: string;
}): Post {
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
    id: generateId(),
    title,
    description,
    createdAT: now,
    modifiedAT: now,
    createdBy,
  };

  posts.push(newPost);
  fs.writeFileSync(filePath, JSON.stringify(posts, null, 2), "utf-8");

  console.log("Post saved successfully");
  console.log(newPost);

  return newPost;
}

// createPost({
//   title: "Sample Post",
//   description: "This is a sample post description.",
//   createdBy: "Anonymous",
// });

export const updatePost = (
  id: string,
  {
    title,
    description,
    createdBy,
  }: { title: string; description: string; createdBy: string }
): void => {
  const dirPath = path.join("src", "data");
  const filePath = path.join(dirPath, "posts.json");
  let posts = fs.readFileSync(filePath, "utf8");
  const parsedData: Post[] = JSON.parse(posts);
  const post: Post | null = getPostById(id);
  if (!post) {
    console.error("Post does not exist");
    return;
  }
  const updatePost = post;
  console.log(post);
  updatePost.id = id;
  updatePost.title = title;
  updatePost.description = description;
  updatePost.createdBy = createdBy;
  console.log(updatePost);
  let newPosts = parsedData.filter((post) => post.id !== id);
  newPosts.push(updatePost);
  fs.writeFileSync(filePath, JSON.stringify(newPosts, null, 2), "utf8");
  console.log("Post updated successfully");
};

// updatePost("o0drl5b3x4", {
//   title: "top",
//   description: "go to school",
//   createdBy: "Sam",
// });

export const deletePost = (id: string) => {
  const postId = getPostById(id);
  if (!postId) {
    console.log("Post not found");
    return;
  } else {
    const dirPath = path.join("src", "data");
    const filePath = path.join(dirPath, "posts.json");
    let posts;
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      posts = JSON.parse(raw);
      if (!Array.isArray(posts)) throw new Error();
      let newPosts = posts.filter((post) => post.id !== id);
      posts = newPosts;
      fs.writeFileSync(filePath, JSON.stringify(posts, null, 2), "utf8");
      console.log("Post deleted successfully");
    } catch (error) {
      console.error("Failed to delete");
    }
  }
};

// console.log(deletePost("4xl7i5i8m1r"));

export function generateId(): string {
  // let firstNum = Math.floor(Math.random() * 9) + 1; // Ensure the first digit is not zero
  // let secondNum = Math.floor(Math.random() * 10) + 1; // Can be zero
  // let ans = firstNum * secondNum;
  // return ans.toString();
  return Math.random().toString(36).substring(2, 15);
}

// console.log(generateId());
