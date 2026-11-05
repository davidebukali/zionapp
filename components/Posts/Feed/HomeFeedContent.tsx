import React from "react";
import { View, StyleSheet } from "react-native";
import { globalStyles } from "../../../assets/styles/theme";
import PostFeedSkeleton from "../PostFeedSkeleton";
import ErrorStateView from "../../Common/ErrorStateView";
import EmptyFeedView from "../EmptyFeedView";
import { InfiniteScrollList } from "../../InfiniteScrollList";
import { HomeFeedContentProps } from "./types";
import { Post } from "../../../features/posts/types";
import { NewPostsPill } from "./NewPostsPill";

export function HomeFeedContent({
  posts,
  isInitialLoading,
  hasError,
  error,
  hasMore,
  isLoadingMore,
  isRefreshing,
  handleRefresh,
  handleLoadMore,
  onPullToRefresh,
  renderPostItem,
  listRef,
  newPostsCount = 0,
  onPressNewPosts,
}: HomeFeedContentProps) {
  if (isInitialLoading) {
    return <PostFeedSkeleton count={2} />;
  }

  if (hasError && posts.length === 0) {
    return (
      <ErrorStateView
        error={error}
        onRetry={handleRefresh}
        isRetrying={isRefreshing}
      />
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyFeedView
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
    );
  }

  return (
    <View style={styles.listWrapper}>
      {newPostsCount > 0 && onPressNewPosts && (
        <NewPostsPill count={newPostsCount} onPress={onPressNewPosts} />
      )}
      <InfiniteScrollList
        listRef={listRef}
        data={posts}
        keyExtractor={(item: Post) => String(item.feedItemId ?? item.id)}
        renderItem={renderPostItem}
        onLoadMore={handleLoadMore}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onRefresh={onPullToRefresh ?? handleRefresh}
        isRefreshing={isRefreshing}
        contentContainerStyle={globalStyles.feedContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1,
    position: "relative",
  },
});
