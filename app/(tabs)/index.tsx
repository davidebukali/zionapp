import React, { useEffect, useCallback, useState } from "react";
import { View } from "react-native";
import { useTheme } from "react-native-paper";

import { globalStyles } from "../../assets/styles/theme";
import PostCard from "../../components/Posts/PostCard";
import { InfiniteScrollList } from "../../components/InfiniteScrollList";
import { Post } from "../../features/posts/postSlice";
import { useGetPostsQuery, useToggleLikePostMutation } from "../../features/posts/postsApi";

const PAGE_SIZE = 3;

export default function Index() {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: posts = [], isFetching, refetch } = useGetPostsQuery({
    page,
    limit: PAGE_SIZE,
  });

  const [toggleLikePost] = useToggleLikePostMutation();

  // Reset refreshing state when query finishes loading
  useEffect(() => {
    if (!isFetching) {
      setIsRefreshing(false);
    }
  }, [isFetching]);

  const hasMore = posts.length >= page * PAGE_SIZE;

  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [isFetching, hasMore]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPage(1);
    refetch();
  }, [refetch]);

  const renderPostItem = useCallback(({ item }: { item: Post }) => {
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
            likes: item.likes || "0",
          })
        }
      />
    );
  }, [toggleLikePost]);

  return (
    <View style={[globalStyles.screen, { backgroundColor: theme.colors.background }]}>
      <InfiniteScrollList
        data={posts}
        renderItem={renderPostItem}
        onLoadMore={handleLoadMore}
        isLoadingMore={isFetching && page > 1}
        hasMore={hasMore}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        contentContainerStyle={globalStyles.feedContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}



