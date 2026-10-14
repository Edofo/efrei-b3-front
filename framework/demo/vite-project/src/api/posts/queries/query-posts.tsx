import { useQuery } from "@tanstack/react-query";
import { queriesKeys } from "@/constants/queriesKeys";
import { getPosts } from "../getPosts";

export const useQueryPosts = () => {
  return useQuery({ queryKey: queriesKeys.posts, queryFn: getPosts });
};