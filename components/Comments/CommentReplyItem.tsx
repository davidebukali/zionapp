import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Avatar, useTheme } from "react-native-paper";

import { globalStyles } from "../../assets/styles/theme";
import type { Comment } from "../../features/comments/types";
import { formatRelativeTime } from "../../utils/date";
import { getUserInitials } from "../../utils/user";

type CommentReplyItemProps = {
  reply: Comment;
  onLike?: (reply: Comment) => void;
  onReply?: (reply: Comment) => void;
  onMore?: (reply: Comment) => void;
};

export const CommentReplyItem = React.memo(function CommentReplyItem({
  reply,
  onLike,
  onReply,
  onMore,
}: CommentReplyItemProps) {
  const theme = useTheme();
  const actionColor = reply.liked ? theme.colors.primary : theme.colors.onSurfaceVariant;

  return (
    <View style={styles.replyRow}>
      {reply.avatarUrl ? (
        <Avatar.Image
          size={32}
          source={{ uri: reply.avatarUrl }}
          style={styles.replyAvatar}
        />
      ) : (
        <Avatar.Text
          size={32}
          label={getUserInitials(reply.author)}
          color="#FFFFFF"
          style={[
            styles.replyAvatar,
            { backgroundColor: reply.avatarColor ?? theme.colors.primary },
          ]}
          labelStyle={styles.avatarLabel}
        />
      )}

      <View style={globalStyles.commentContent}>
        <View style={globalStyles.commentMetaRow}>
          <Text style={[globalStyles.commentAuthor, { color: theme.colors.onSurface }]}>
            {reply.author}
          </Text>
          <Text
            style={[
              globalStyles.commentTimestamp,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            · {formatRelativeTime(reply.createdAt)}
          </Text>
          {onMore ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`More options for ${reply.author}'s reply`}
              onPress={() => onMore(reply)}
              style={globalStyles.commentMoreButton}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={[globalStyles.commentBody, styles.replyBody, { color: theme.colors.onSurface }]}>
          {reply.body}
        </Text>

        <View style={globalStyles.commentActions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`${reply.likes} likes`}
            onPress={() => onLike?.(reply)}
            style={globalStyles.commentAction}
          >
            <Ionicons
              name={reply.liked ? "heart" : "heart-outline"}
              size={15}
              color={actionColor}
            />
            {reply.likes > 0 ? (
              <Text style={[globalStyles.commentActionText, { color: actionColor }]}>
                {reply.likes}
              </Text>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Reply to ${reply.author}`}
            onPress={() => onReply?.(reply)}
            style={globalStyles.commentAction}
          >
            <Ionicons name="return-down-forward" size={15} color={theme.colors.onSurfaceVariant} />
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
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  replyRow: {
    flexDirection: "row",
    paddingTop: 12,
    paddingBottom: 4,
  },
  replyAvatar: {
    marginRight: 10,
  },
  avatarLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  replyBody: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
});

