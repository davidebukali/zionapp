import React, { useEffect, useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { useTheme } from "react-native-paper";

import { globalStyles } from "../../../assets/styles/theme";
import PostCard from "../../../components/Posts/PostCard";
import PostFeedSkeleton from "../../../components/Posts/PostFeedSkeleton";
import EmptyFeedView from "../../../components/Posts/EmptyFeedView";
import { InfiniteScrollList } from "../../../components/InfiniteScrollList";
import { Post } from "../../../features/posts/types";
import {
  useGetFeedQuery,
  useGetPostsQuery,
  useToggleLikePostMutation,
} from "../../../features/posts/api";

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
    refetch: refetchFeed,
  } = useGetFeedQuery({ cursor });

  // Fallback to public posts if feed is empty or unpopulated
  const shouldFallbackToPosts =
    !isFetchingFeed && (isFeedError || (feedData?.posts && feedData.posts.length === 0));

  const {
    data: publicPosts = [],
    isFetching: isFetchingPosts,
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
