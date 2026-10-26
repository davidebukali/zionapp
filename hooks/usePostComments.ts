import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import {
  useCreateCommentMutation,
  useGetCommentsQuery,
  useLazyGetCommentsQuery,
  useToggleLikeCommentMutation,
} from "../features/comments/api";
import { Comment } from "../features/comments/types";
import { postsApi, useGetPostQuery } from "../features/posts/api";
import { RootState } from "../store/store";

const selectCachedFeed = postsApi.endpoints.getFeed.select();

export function usePostComments(postId: string) {
  const [draft, setDraft] = useState("");
  const [accumulatedComments, setAccumulatedComments] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Authenticated user profile
  const authUser = useSelector((state: RootState) => state.auth.user);
  const currentUser = useMemo(() => {
    const displayName =
      authUser?.profile?.display_name || authUser?.name || "Member";
    const initials = displayName
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "M";

    return {
      id: authUser?.id ? String(authUser.id) : undefined,
      name: displayName,
      username:
        authUser?.profile?.username ||
        authUser?.name?.toLowerCase().replace(/\s+/g, "") ||
        "member",
      initials,
      avatarUrl: authUser?.profile?.avatar_media_id ? undefined : undefined,
    };
  }, [authUser]);

  // Post details & fallback cache lookup
  const { data: fetchedPost } = useGetPostQuery(postId, { skip: !postId });
  const feedPosts = useSelector(
    (state: RootState) => selectCachedFeed(state).data?.posts
  );
  const post = fetchedPost || feedPosts?.find((item) => item.id === postId);
  const displayedCount = post?.comments ?? "";

  // Initial comments query
  const {
    data: initialData,
    isLoading: isInitialLoading,
    isFetching: isInitialFetching,
    error: initialError,
    refetch,
  } = useGetCommentsQuery({ postId }, { skip: !postId });

  const [lazyFetchComments] = useLazyGetCommentsQuery();
  const [createComment, { isLoading: isSubmitting }] = useCreateCommentMutation();
  const [toggleLikeComment] = useToggleLikeCommentMutation();

  // Sync initial query results into accumulated list
  useEffect(() => {
    if (initialData?.comments) {
      setAccumulatedComments(initialData.comments);
      setNextCursor(initialData.nextCursor ?? null);
    }
  }, [initialData]);

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    if (!postId || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const result = await refetch().unwrap();
      if (result?.comments) {
        setAccumulatedComments(result.comments);
        setNextCursor(result.nextCursor ?? null);
      }
    } catch {
      // Handled by RTK Query error state
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, postId, refetch]);

  // Infinite scroll load more
  const handleLoadMore = useCallback(async () => {
    if (!postId || !nextCursor || isLoadingMore || isRefreshing) return;
    setIsLoadingMore(true);
    try {
      const response = await lazyFetchComments({
        postId,
        cursor: nextCursor,
      }).unwrap();

      if (response?.comments) {
        setAccumulatedComments((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const uniqueNew = response.comments.filter((c) => !existingIds.has(c.id));
          return [...prev, ...uniqueNew];
        });
        setNextCursor(response.nextCursor ?? null);
      }
    } catch {
      // Error handling
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, isRefreshing, lazyFetchComments, nextCursor, postId]);

  // Submit comment
  const handleSubmitComment = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || isSubmitting || !postId) return;

    try {
      const created = await createComment({
        postId,
        content: trimmed,
      }).unwrap();

      setDraft("");
      setAccumulatedComments((prev) => {
        const filtered = prev.filter((c) => c.id !== created.id);
        return [created, ...filtered];
      });
    } catch {
      // Error handled by mutation state
    }
  }, [createComment, draft, isSubmitting, postId]);

  // Like comment
  const handleLikeComment = useCallback(
    async (comment: Comment) => {
      if (!postId) return;
      // Optimistic update in local list
      setAccumulatedComments((prev) =>
        prev.map((c) => {
          if (c.id === comment.id) {
            const nextLiked = !c.liked;
            return {
              ...c,
              liked: nextLiked,
              likes: Math.max(0, c.likes + (nextLiked ? 1 : -1)),
            };
          }
          return c;
        })
      );

      try {
        await toggleLikeComment({
          commentId: comment.id,
          postId,
          liked: comment.liked,
        }).unwrap();
      } catch {
        // Rollback on failure
        setAccumulatedComments((prev) =>
          prev.map((c) => (c.id === comment.id ? comment : c))
        );
      }
    },
    [postId, toggleLikeComment]
  );

  return {
    comments: accumulatedComments,
    displayedCount,
    currentUser,
    draft,
    setDraft,
    hasMore: Boolean(nextCursor),
    isInitialLoading,
    isLoadingMore,
    isRefreshing,
    isSubmitting,
    error: initialError ? "Failed to load comments" : null,
    refresh: handleRefresh,
    loadMore: handleLoadMore,
    submitComment: handleSubmitComment,
    likeComment: handleLikeComment,
  };
}
