import React, { useCallback, useEffect, useMemo } from "react";
import { AppState, AppStateStatus, FlatList } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { Post } from "../features/posts/types";
import { useLazyCheckNewerFeedQuery } from "../features/posts/api";
import {
  catchUpCountReceived,
  resetNewPosts as resetNewPostsAction,
} from "../features/posts/newPostsSlice";
import { getNewPostsCount } from "../features/posts/utils";

interface UseFeedNewPostsArgs {
  posts: Post[];
  listRef: React.RefObject<FlatList<Post>>;
  onRefresh: () => void;
}

export function useFeedNewPosts({
  posts,
  listRef,
  onRefresh,
}: UseFeedNewPostsArgs) {
  const dispatch = useDispatch<AppDispatch>();
  const { pendingPostIds, catchUpCount } = useSelector(
    (state: RootState) => state.newPosts
  );
  const [checkNewerFeed] = useLazyCheckNewerFeedQuery();

  const topFeedItemId = posts[0]?.feedItemId ?? posts[0]?.id;

  const loadedPostIds = useMemo(
    () => new Set(posts.map((post) => String(post.id))),
    [posts]
  );

  const newPostsCount = getNewPostsCount(
    pendingPostIds,
    catchUpCount,
    loadedPostIds
  );

  // On-demand catch-up check when app returns to the foreground
  useEffect(() => {
    let previousState: AppStateStatus = AppState.currentState;

    const subscription = AppState.addEventListener(
      "change",
      async (nextState: AppStateStatus) => {
        const isResuming =
          Boolean(previousState.match(/inactive|background/)) &&
          nextState === "active";
        previousState = nextState;

        if (!isResuming || !topFeedItemId) {
          return;
        }

        try {
          const serverCount = await checkNewerFeed({
            afterId: topFeedItemId,
          }).unwrap();
          dispatch(catchUpCountReceived(serverCount));
        } catch {
          // Gracefully ignore network errors on resume
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [topFeedItemId, checkNewerFeed, dispatch]);

  const resetNewPosts = useCallback(() => {
    dispatch(resetNewPostsAction());
  }, [dispatch]);

  const handlePressNewPosts = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    resetNewPosts();
    onRefresh();
  }, [listRef, onRefresh, resetNewPosts]);

  const handlePullToRefresh = useCallback(() => {
    resetNewPosts();
    onRefresh();
  }, [resetNewPosts, onRefresh]);

  return {
    newPostsCount,
    resetNewPosts,
    handlePressNewPosts,
    handlePullToRefresh,
  };
}

