import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { PostCard } from "../Posts/PostCard";
import { ProfileFeedProps } from "./types";

export function ProfileFeed({
  activeTab,
  posts,
  isPostsLoading,
  isFetchingMore = false,
  isPrivateAccount = false,
  isFollowLoading = false,
  currentUserId,
  onLikePost,
  onRepostPost,
  onBookmarkPost,
  onCommentPost,
  onPressFollow,
}: ProfileFeedProps) {
  const theme = useTheme();

  if (isPrivateAccount) {
    return (
      <View style={styles.emptyContainer}>
        <View
          style={[
            styles.lockIconContainer,
            {
              backgroundColor: theme.dark
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.04)",
            },
          ]}
        >
          <Ionicons
            name="lock-closed-outline"
            size={36}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
          This account is private
        </Text>
        <Text
          style={[
            styles.emptySubtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Follow this account to see their posts, likes, and reposts.
        </Text>
        {onPressFollow && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Follow private account"
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.primary,
              },
            ]}
            disabled={isFollowLoading}
            onPress={onPressFollow}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.actionButtonText,
                { color: theme.colors.onPrimary },
              ]}
            >
              {isFollowLoading ? "Following..." : "Follow"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (isPostsLoading && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }

  if (posts.length === 0) {
    const tabLabels: Record<
      string,
      { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string }
    > = {
      posts: {
        icon: "newspaper-outline",
        title: "No posts yet",
        subtitle: "When posts are published, they will show up here.",
      },
      likes: {
        icon: "heart-outline",
        title: "No liked posts yet",
        subtitle: "Posts liked by this user will appear here.",
      },
      reposts: {
        icon: "repeat-outline",
        title: "No reposts yet",
        subtitle: "Reposts will appear here.",
      },
      bookmarks: {
        icon: "bookmark-outline",
        title: "No bookmarks yet",
        subtitle: "Saved posts will appear here.",
      },
    };

    const emptyInfo = tabLabels[activeTab] || tabLabels.posts;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name={emptyInfo.icon}
          size={48}
          color={theme.colors.onSurfaceVariant}
          style={styles.emptyIcon}
        />
        <Text style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
          {emptyInfo.title}
        </Text>
        <Text
          style={[
            styles.emptySubtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {emptyInfo.subtitle}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.feedContainer}>
      {posts.map((post) => {
        const isOwnPost = Boolean(
          currentUserId &&
            (String(post.authorId) === String(currentUserId) ||
              post.author === currentUserId)
        );

        return (
          <View key={post.id} style={styles.postCardWrapper}>
            <PostCard
              title={post.title}
              createdAt={post.createdAt}
              body={post.content}
              truncateBody={true}
              avatarUrl={post.avatarUrl}
              imageUrl={post.imageUrl}
              mediaWidth={post.mediaWidth}
              mediaHeight={post.mediaHeight}
              media={post.media}
              likes={post.likes}
              comments={post.comments}
              liked={post.liked}
              isReposted={post.isReposted}
              repostsCount={post.repostsCount}
              bookmarked={Boolean(post.isBookmarked ?? post.bookmarked)}
              isOwnPost={isOwnPost}
              activityType={post.activityType}
              activityActor={post.activityActor}
              onLike={() => onLikePost?.(post.id, !post.liked)}
              onPressRepost={() => onRepostPost?.(post.id)}
              onPressBookmark={() => onBookmarkPost?.(post.id)}
              onComment={() => onCommentPost?.(post.id)}
            />
          </View>
        );
      })}
      {isFetchingMore && (
        <View style={styles.fetchingMoreContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  feedContainer: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  postCardWrapper: {
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
  },
  fetchingMoreContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    paddingHorizontal: 32,
  },
  lockIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyIcon: {
    marginBottom: 14,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
