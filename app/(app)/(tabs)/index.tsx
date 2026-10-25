import React, { useEffect, useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { useTheme } from "react-native-paper";

import { globalStyles } from "../../../assets/styles/theme";
import PostCard from "../../../components/Posts/PostCard";
import PostFeedSkeleton from "../../../components/Posts/PostFeedSkeleton";
import EmptyFeedView from "../../../components/Posts/EmptyFeedView";
import ErrorStateView from "../../../components/Common/ErrorStateView";
import { InfiniteScrollList } from "../../../components/InfiniteScrollList";
import { Post } from "../../../features/posts/types";
import {
  useGetFeedQuery,
  useGetPostsQuery,
  useToggleLikePostMutation,
} from "../../../features/posts/api";
import { isNetworkError } from "../../../utils/network";

export default function Index() {
  const theme = useTheme();
  const router = useRouter();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load personalized feed for logged in user
  const {
    data: feedData,
    isFetching: isFetchingFeed,
    isError: isFeedError,
    error: feedError,
    refetch: refetchFeed,
  } = useGetFeedQuery({ cursor });

  // Skip public posts fallback if feed failed specifically due to a network connection error
  const isFeedNetworkError = isNetworkError(feedError);

  const shouldFallbackToPosts =
    !isFetchingFeed &&
    !isFeedNetworkError &&
    (isFeedError || (feedData?.posts && feedData.posts.length === 0));

  const {
    data: publicPosts = [],
    isFetching: isFetchingPosts,
    isError: isPostsError,
    error: postsError,
    refetch: refetchPosts,
  } = useGetPostsQuery(undefined, { skip: !shouldFallbackToPosts });

  const [toggleLikePost] = useToggleLikePostMutation();

  const isFetching = isFetchingFeed || isFetchingPosts;
  const posts =
    feedData?.posts && feedData.posts.length > 0
      ? feedData.posts
      : shouldFallbackToPosts
      ? publicPosts
      : [];

  const isInitialLoading =
    (isFetchingFeed && !feedData) ||
    (shouldFallbackToPosts && isFetchingPosts && !publicPosts?.length);

  const hasError = isFeedError || (shouldFallbackToPosts && isPostsError);
  const activeError = feedError || postsError;

  const hasMore = Boolean(feedData?.nextCursor);

  // Reset refreshing state when query finishes loading
  useEffect(() => {
    if (!isFetching) {
      setIsRefreshing(false);
    }
  }, [isFetching]);

  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasMore && feedData?.nextCursor) {
      setCursor(feedData.nextCursor);
    }
  }, [isFetching, hasMore, feedData?.nextCursor]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setCursor(undefined);
    refetchFeed();
    if (shouldFallbackToPosts) {
      refetchPosts();
    }
  }, [refetchFeed, refetchPosts, shouldFallbackToPosts]);

  const renderPostItem = useCallback(
    ({ item }: { item: Post }) => {
      return (
        <PostCard
          title={item.title}
          createdAt={item.createdAt}
          body={item.content}
          avatarUrl={item.avatarUrl}
          imageUrl={item.imageUrl}
          likes={item.likes}
          comments={item.comments}
          liked={item.liked}
          onLike={() =>
            toggleLikePost({
              postId: item.id,
              liked: !!item.liked,
            })
          }
          onComment={() =>
            router.push({
              pathname: "/posts/[postId]/PostComments",
              params: { postId: item.id, count: item.comments ?? "0" },
            })
          }
        />
      );
    },
    [router, toggleLikePost]
  );

  return (
    <View style={[globalStyles.screen, { backgroundColor: theme.colors.background }]}>
      {isInitialLoading ? (
        <PostFeedSkeleton count={2} />
      ) : hasError && posts.length === 0 ? (
        <ErrorStateView
          error={activeError}
          onRetry={handleRefresh}
          isRetrying={isRefreshing}
        />
      ) : posts.length === 0 ? (
        <EmptyFeedView onRefresh={handleRefresh} isRefreshing={isRefreshing} />
      ) : (
        <InfiniteScrollList
          data={posts}
          renderItem={renderPostItem}
          onLoadMore={handleLoadMore}
          isLoadingMore={isFetching && !!cursor}
          hasMore={hasMore}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          contentContainerStyle={globalStyles.feedContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
