import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Avatar, useTheme } from "react-native-paper";

import { globalStyles } from "../../assets/styles/theme";
import type { Comment } from "../../features/comments/types";
import { useCommentReplies } from "../../hooks/useCommentReplies";
import { formatRelativeTime } from "../../utils/date";
import { getUserInitials } from "../../utils/user";
import { CommentReplyItem } from "./CommentReplyItem";

type CommentItemProps = {
  comment: Comment;
  onLike?: (comment: Comment) => void;
  onReply?: (targetComment: Comment, topLevelParent?: Comment) => void;
  onMore?: (comment: Comment) => void;
};

export function CommentItem({ comment, onLike, onReply, onMore }: CommentItemProps) {
  const theme = useTheme();
  const actionColor = comment.liked ? theme.colors.primary : theme.colors.onSurfaceVariant;

  const {
    replies,
    isExpanded,
    isLoading,
    isLoadingMore,
    hasMore,
    toggleExpand,
    loadMoreReplies,
    likeReply,
  } = useCommentReplies(comment.id, comment.postId);

  const totalRepliesCount = Math.max(comment.replies || 0, replies.length);

  return (
    <View
      style={[
        globalStyles.commentItem,
        { borderBottomColor: theme.colors.outlineVariant },
      ]}
    >
      {comment.avatarUrl ? (
        <Avatar.Image
          size={42}
          source={{ uri: comment.avatarUrl }}
          style={globalStyles.commentAvatar}
        />
      ) : (
        <Avatar.Text
          size={42}
          label={getUserInitials(comment.author)}
          color="#FFFFFF"
          style={[
            globalStyles.commentAvatar,
            { backgroundColor: comment.avatarColor ?? theme.colors.primary },
          ]}
          labelStyle={styles.avatarLabel}
        />
      )}

      <View style={globalStyles.commentContent}>
        <View style={globalStyles.commentMetaRow}>
          <Text style={[globalStyles.commentAuthor, { color: theme.colors.onSurface }]}>
            {comment.author}
          </Text>
          <Text
            style={[
              globalStyles.commentTimestamp,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            · {formatRelativeTime(comment.createdAt)}
          </Text>
          {onMore ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`More options for ${comment.author}'s comment`}
              onPress={() => onMore(comment)}
              style={globalStyles.commentMoreButton}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={[globalStyles.commentBody, { color: theme.colors.onSurface }]}>
          {comment.body}
        </Text>

        <View style={globalStyles.commentActions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`${comment.likes} likes`}
            onPress={() => onLike?.(comment)}
            style={globalStyles.commentAction}
          >
            <Ionicons
              name={comment.liked ? "heart" : "heart-outline"}
              size={17}
              color={actionColor}
            />
            {comment.likes > 0 ? (
              <Text style={[globalStyles.commentActionText, { color: actionColor }]}>
                {comment.likes}
              </Text>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Reply to ${comment.author}`}
            onPress={() => onReply?.(comment, comment)}
            style={globalStyles.commentAction}
          >
            <Ionicons name="return-down-forward" size={17} color={theme.colors.onSurfaceVariant} />
            <Text
              style={[
                globalStyles.commentActionText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Reply
            </Text>
          </TouchableOpacity>
        </View>

        {/* Expandable replies toggle */}
        {totalRepliesCount > 0 ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={
              isExpanded
                ? "Hide replies"
                : `View ${totalRepliesCount} ${totalRepliesCount === 1 ? "reply" : "replies"}`
            }
            onPress={toggleExpand}
            style={styles.viewRepliesToggle}
          >
            <View style={[styles.repliesLine, { backgroundColor: theme.colors.outlineVariant }]} />
            <Text style={[styles.viewRepliesText, { color: theme.colors.onSurfaceVariant }]}>
              {isExpanded
                ? "Hide replies"
                : `View ${totalRepliesCount} ${totalRepliesCount === 1 ? "reply" : "replies"}`}
            </Text>
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                style={styles.replyLoadingIndicator}
              />
            ) : null}
          </TouchableOpacity>
        ) : null}

        {/* Expanded replies list */}
        {isExpanded ? (
          <View style={styles.repliesContainer}>
            {replies.map((replyItem) => (
              <CommentReplyItem
                key={replyItem.id}
                reply={replyItem}
                onLike={likeReply}
                onReply={(targetReply) => onReply?.(targetReply, comment)}
                onMore={onMore}
              />
            ))}

            {hasMore ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="View more replies"
                onPress={loadMoreReplies}
                disabled={isLoadingMore}
                style={styles.loadMoreRepliesButton}
              >
                <Text style={[styles.viewRepliesText, { color: theme.colors.primary }]}>
                  {isLoadingMore ? "Loading replies..." : "View more replies"}
                </Text>
                {isLoadingMore ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                    style={styles.replyLoadingIndicator}
                  />
                ) : null}
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  viewRepliesToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 4,
  },
  repliesLine: {
    width: 24,
    height: 1,
    marginRight: 8,
  },
  viewRepliesText: {
    fontSize: 13,
    fontWeight: "600",
  },
  replyLoadingIndicator: {
    marginLeft: 8,
  },
  repliesContainer: {
    marginTop: 4,
  },
  loadMoreRepliesButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
});
