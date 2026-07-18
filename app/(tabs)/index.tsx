import React, { useEffect, useCallback } from "react";
import { View } from "react-native";
import { useTheme } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { globalStyles } from "../../assets/styles/theme";
import PostCard from "../../components/Posts/PostCard";
import { InfiniteScrollList } from "../../components/InfiniteScrollList";
import { fetchPosts, Post, toggleLikePost } from "../../features/posts/postSlice";
import { AppDispatch, RootState } from "../../store/store";

const PAGE_SIZE = 3;

export default function Index() {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { posts, isLoading, isRefreshing, hasMore, page } = useSelector(
    (state: RootState) => state.post
  );

  // Fetch initial posts on mount
  useEffect(() => {
    dispatch(fetchPosts({ page: 1, limit: PAGE_SIZE, isRefresh: true }));
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && !isRefreshing && hasMore) {
      dispatch(fetchPosts({ page: page + 1, limit: PAGE_SIZE }));
    }
  }, [dispatch, page, isLoading, isRefreshing, hasMore]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchPosts({ page: 1, limit: PAGE_SIZE, isRefresh: true }));
  }, [dispatch]);

  const renderPostItem = useCallback(({ item }: { item: Post }) => {
    return (
      <PostCard
        title={item.title}
        subtitle={item.createdAt}
        body={item.content}
        avatarUrl={item.avatarUrl}
        imageUrl={item.imageUrl}
        likes={item.likes}
        comments={item.comments}
        liked={item.liked}
        onLike={() =>
          dispatch(
            toggleLikePost({
              postId: item.id,
              liked: !!item.liked,
              likes: item.likes || "0",
            })
          )
        }
      />
    );
  }, [dispatch]);

  return (
    <View style={[globalStyles.screen, { backgroundColor: theme.colors.background }]}>
      <InfiniteScrollList
        data={posts}
        renderItem={renderPostItem}
        onLoadMore={handleLoadMore}
        isLoadingMore={isLoading}
        hasMore={hasMore}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        contentContainerStyle={globalStyles.feedContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}


