import { useCallback, useMemo, useState } from "react";
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
import { getUserAvatarUrl, getUserInitials } from "../utils/user";

const selectCachedFeed = postsApi.endpoints.getFeed.select();

export function usePostComments(postId: string) {
  const [draft, setDraft] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Authenticated user profile
  const authUser = useSelector((state: RootState) => state.auth.user);
  const currentUser = useMemo(() => {
    const displayName =
      authUser?.profile?.display_name || authUser?.name || "Member";
    const initials = getUserInitials(displayName, authUser?.email, "M");
    const avatarUrl = getUserAvatarUrl(authUser);

    return {
      id: authUser?.id ? String(authUser.id) : undefined,
      name: displayName,
      username:
        authUser?.profile?.username ||
        authUser?.name?.toLowerCase().replace(/\s+/g, "") ||
        "member",
      initials,
      avatarUrl,
    };
  }, [authUser]);

  // Post details & fallback cache lookup
  const { data: fetchedPost } = useGetPostQuery(postId, { skip: !postId });
  const feedPosts = useSelector(
    (state: RootState) => selectCachedFeed(state).data?.posts
  );
  const post = fetchedPost || feedPosts?.find((item) => item.id === postId);
  const displayedCount = post?.comments ?? "";

  // Paginated comments query (cache-managed)
  const {
    data: commentsResult,
    isLoading: isInitialLoading,
    error: initialError,
    refetch,
  } = useGetCommentsQuery({ postId }, { skip: !postId });

  const [lazyFetchComments] = useLazyGetCommentsQuery();
  const [createComment, { isLoading: isSubmitting }] = useCreateCommentMutation();
  const [toggleLikeComment] = useToggleLikeCommentMutation();

  const comments = commentsResult?.comments ?? [];
  const hasMore = Boolean(commentsResult?.nextCursor);

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    if (!postId || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refetch().unwrap();
    } catch {
      // Handled by RTK Query error state
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, postId, refetch]);

  // Infinite scroll load more
  const handleLoadMore = useCallback(async () => {
    const nextCursor = commentsResult?.nextCursor;
    if (!postId || !nextCursor || isLoadingMore || isRefreshing) return;
    setIsLoadingMore(true);
    try {
      await lazyFetchComments({
        postId,
        cursor: nextCursor,
      }).unwrap();
    } catch {
      // Handled by RTK Query error state
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    commentsResult?.nextCursor,
    isLoadingMore,
    isRefreshing,
    lazyFetchComments,
    postId,
  ]);

  // Submit comment
  const handleSubmitComment = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || isSubmitting || !postId) return;

    try {
      await createComment({
        postId,
        content: trimmed,
      }).unwrap();
      setDraft("");
    } catch {
      // Handled by mutation error state
    }
  }, [createComment, draft, isSubmitting, postId]);

  // Like comment
  const handleLikeComment = useCallback(
    async (comment: Comment) => {
      if (!postId) return;
      try {
        await toggleLikeComment({
          commentId: comment.id,
          postId,
          liked: comment.liked,
        }).unwrap();
      } catch {
        // Rollback handled by toggleLikeComment onQueryStarted
      }
    },
    [postId, toggleLikeComment]
  );

  return {
    comments,
    displayedCount,
    currentUser,
    draft,
    setDraft,
    hasMore,
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
