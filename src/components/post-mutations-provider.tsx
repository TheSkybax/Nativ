"use client";

import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import { createPostMutationState, postMutationReducer } from "@/lib/post-mutations";
import type { FeedPost } from "./feed-post-card";

type PostMutationContextValue = {
  resolvePost: (post: FeedPost) => FeedPost;
  isDeleted: (id: string) => boolean;
  updatePost: (id: string, changes: Partial<FeedPost>) => void;
  deletePost: (id: string) => void;
};

const PostMutationContext = createContext<PostMutationContextValue | null>(null);

export function PostMutationsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    postMutationReducer<FeedPost>,
    undefined,
    createPostMutationState<FeedPost>
  );

  const resolvePost = useCallback((post: FeedPost): FeedPost => {
    const updated = { ...post, ...state.updates[post.id] };
    return post.originalPost
      ? { ...updated, originalPost: resolvePost(post.originalPost) }
      : updated;
  }, [state.updates]);

  const isDeleted = useCallback((id: string) => state.deletedIds.includes(id), [state.deletedIds]);
  const updatePost = useCallback((id: string, changes: Partial<FeedPost>) => {
    dispatch({ type: "update", id, changes });
  }, []);
  const deletePost = useCallback((id: string) => {
    dispatch({ type: "delete", id });
  }, []);

  const value = useMemo(
    () => ({ resolvePost, isDeleted, updatePost, deletePost }),
    [resolvePost, isDeleted, updatePost, deletePost]
  );

  return <PostMutationContext.Provider value={value}>{children}</PostMutationContext.Provider>;
}

export function usePostMutations() {
  const context = useContext(PostMutationContext);
  if (!context) {
    throw new Error("usePostMutations must be used within PostMutationsProvider.");
  }
  return context;
}
