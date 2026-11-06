import { useCallback, useState } from "react";
import {
  useGetCommentRepliesQuery,
  useLazyGetCommentRepliesQuery,
  useToggleLikeCommentMutation,
} from "../features/comments/api";
import { Comment } from "../features/comments/types";

export function useCommentReplies(commentId: string, postId: string) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const {
    data: repliesResult,
    isLoading: isInitialLoading,
    isFetching,
  } = useGetCommentRepliesQuery(
    { commentId },
    { skip: !isExpanded || !commentId }
  );

  const [lazyFetchReplies] = useLazyGetCommentRepliesQuery();
  const [toggleLikeComment] = useToggleLikeCommentMutation();

  const replies = repliesResult?.replies ?? [];
  const nextCursor = repliesResult?.nextCursor;
  const hasMore = Boolean(nextCursor);

  const toggleExpand = useCallback(() => {
    setIsExpanded((previousExpanded) => !previousExpanded);
  }, []);

  const handleLoadMoreReplies = useCallback(async () => {
    if (!commentId || !nextCursor || isLoadingMore || isFetching) return;
    setIsLoadingMore(true);
    try {
      await lazyFetchReplies({
        commentId,
        cursor: nextCursor,
      }).unwrap();
    } catch {
      // Handled by RTK Query error state
    } finally {
      setIsLoadingMore(false);
    }
  }, [commentId, isFetching, isLoadingMore, lazyFetchReplies, nextCursor]);

  const handleLikeReply = useCallback(
    async (reply: Comment) => {
      if (!postId || !commentId) return;
      try {
        await toggleLikeComment({
          commentId: reply.id,
          postId,
          liked: reply.liked,
          parentCommentId: commentId,
        }).unwrap();
      } catch {
        // Rollback handled by toggleLikeComment onQueryStarted
      }
    },
    [commentId, postId, toggleLikeComment]
  );

  return {
    replies,
    isExpanded,
    isLoading: isInitialLoading && isFetching,
    isLoadingMore,
    hasMore,
    toggleExpand,
    loadMoreReplies: handleLoadMoreReplies,
    likeReply: handleLikeReply,
  };
}

