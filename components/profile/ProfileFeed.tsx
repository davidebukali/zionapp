import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Post } from "../../features/posts/types";
import { PostCard } from "../Posts/PostCard";
import { ProfileTabType } from "./types";

interface ProfileFeedProps {
  activeTab: ProfileTabType;
  posts: Post[];
  isPostsLoading: boolean;
  currentUserId?: string | number;
  onLikePost?: (postId: string, liked: boolean) => void;
  onRepostPost?: (postId: string) => void;
  onBookmarkPost?: (postId: string) => void;
  onCommentPost?: (postId: string) => void;
}

export function ProfileFeed({
  activeTab,
  posts,
  isPostsLoading,
  currentUserId,
  onLikePost,
  onRepostPost,
  onBookmarkPost,
  onCommentPost,
}: ProfileFeedProps) {
  const theme = useTheme();

  if (activeTab !== "posts") {
    const tabLabels: Record<string, { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string }> = {
      likes: {
        icon: "heart-outline",
        title: "No liked posts yet",
        subtitle: "Posts you or this user like will appear here.",
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

    const emptyInfo = tabLabels[activeTab] || tabLabels.likes;

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

  if (posts.length === 0 && !isPostsLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="newspaper-outline"
          size={48}
          color={theme.colors.onSurfaceVariant}
          style={styles.emptyIcon}
        />
        <Text style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
          No posts yet
        </Text>
        <Text
          style={[
            styles.emptySubtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          When posts are published, they will show up here.
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
              avatarUrl={post.avatarUrl}
              imageUrl={post.imageUrl}
              mediaWidth={post.mediaWidth}
              mediaHeight={post.mediaHeight}
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    paddingHorizontal: 32,
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
  },
});
