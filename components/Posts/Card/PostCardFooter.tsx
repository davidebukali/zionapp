import React from "react";
import { View } from "react-native";
import { Card } from "react-native-paper";

import { globalStyles, postTokens } from "../../../assets/styles/theme";
import { PostAction } from "../PostAction";

interface PostCardFooterProps {
  likes?: string;
  comments?: string;
  liked?: boolean;
  isReposted?: boolean;
  repostsCount?: number;
  bookmarked?: boolean;
  onPressLike?: () => void;
  onPressComment?: () => void;
  onPressRepost?: () => void;
  onPressBookmark?: () => void;
}

export function PostCardFooter({
  likes = "",
  comments = "",
  liked = false,
  isReposted = false,
  repostsCount = 0,
  bookmarked = false,
  onPressLike,
  onPressComment,
  onPressRepost,
  onPressBookmark,
}: PostCardFooterProps) {
  const likesCount = parseInt(likes, 10) || 0;
  const commentsCount = parseInt(comments, 10) || 0;

  const likesLabel = likesCount > 0 ? likes : undefined;
  const commentsLabel = commentsCount > 0 ? comments : undefined;
  const repostsLabel = repostsCount > 0 ? String(repostsCount) : undefined;

  const likeColor = liked ? postTokens.activeActionColor : postTokens.actionColor;
  const repostColor = isReposted ? "#34C759" : postTokens.actionColor;
  const bookmarkColor = bookmarked ? postTokens.activeActionColor : postTokens.actionColor;

  return (
    <Card.Actions style={globalStyles.postFooter}>
      <View style={globalStyles.postActionGroup}>
        <PostAction
          icon={liked ? "heart" : "heart-outline"}
          label={likesLabel}
          color={likeColor}
          accessibilityLabel={`${likes || "0"} likes`}
          onPress={onPressLike}
        />
        <PostAction
          icon="chatbox-outline"
          label={commentsLabel}
          color={postTokens.actionColor}
          accessibilityLabel={`${comments || "0"} comments`}
          onPress={onPressComment}
        />
        <PostAction
          icon={isReposted ? "repeat" : "repeat-outline"}
          label={repostsLabel}
          color={repostColor}
          accessibilityLabel={`${repostsCount} reposts`}
          onPress={onPressRepost}
        />
      </View>

      <PostAction
        icon={bookmarked ? "bookmark" : "bookmark-outline"}
        color={bookmarkColor}
        accessibilityLabel={bookmarked ? "Saved post" : "Save post"}
        onPress={onPressBookmark}
      />
    </Card.Actions>
  );
}
