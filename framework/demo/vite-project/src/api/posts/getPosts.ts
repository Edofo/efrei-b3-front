import type { Post } from "@/types/posts.type";
import { httpClient } from "../httpClient";

export const getPosts = async () => {
  const response = await httpClient.get<Post[]>("/posts");
  if (response.status !== 200) {
    throw new Error("Failed to fetch posts");
  }
  return response.data;
};
