import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useTheme } from "react-native-paper";

import { globalStyles } from "../../../assets/styles/theme";
import { getUserAvatarUrl } from "../../../utils/user";
import { useGetPostQuery } from "../../../features/posts/api";
import { ChatPostCardAuthorRow } from "./ChatPostCardAuthorRow";
import { ChatPostCardImage } from "./ChatPostCardImage";
import {
  ChatPostCardLoading,
  ChatPostCardUnavailable,
} from "./ChatPostCardStates";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.72, 280);

export interface ChatPostCardProps {
  postId: string;
  isOutgoing?: boolean;
}

export const ChatPostCard = React.memo(function ChatPostCard({
  postId,
  isOutgoing = false,
}: ChatPostCardProps) {
  const theme = useTheme();
  const { data: post, isLoading, isError } = useGetPostQuery(postId);

  const handlePress = () => {
    router.push({
      pathname: "/posts/[postId]",
      params: { postId },
    });
  };

  if (isLoading) {
    return <ChatPostCardLoading width={CARD_WIDTH} />;
  }

  if (isError || !post) {
    return <ChatPostCardUnavailable width={CARD_WIDTH} />;
  }

  const postImage =
    post.imageUrl ||
    (post.media && post.media.length > 0 ? post.media[0].url : undefined);

  const avatarUrl = post.avatarUrl || getUserAvatarUrl(post);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`Post by ${post.author}`}
      style={[
        styles.container,
        {
          width: CARD_WIDTH,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
          borderBottomRightRadius: isOutgoing ? 4 : 16,
          borderBottomLeftRadius: isOutgoing ? 16 : 4,
        },
      ]}
    >
      {/* Featured Header Image (collapses if no image) */}
      <ChatPostCardImage imageUrl={postImage} />

      {/* Post Metadata & Content Container */}
      <View style={styles.contentContainer}>
        {/* Author Avatar, Name (aligned left next to avatar) and Timestamp */}
        <ChatPostCardAuthorRow
          author={post.author}
          avatarUrl={avatarUrl}
          createdAt={post.createdAt}
        />

        {/* Shortened Body Preview (2 Lines Max) */}
        {Boolean(post.content) && (
          <Text
            style={[
              globalStyles.postBodyText,
              styles.bodyText,
              { color: theme.colors.onSurface },
            ]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {post.content}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
