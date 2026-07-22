import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, TouchableOpacity, View } from "react-native";
import { Avatar, useTheme } from "react-native-paper";

import { globalStyles } from "../../assets/styles/theme";
import type { Comment } from "../../features/comments/commentSlice";
import { formatRelativeTime } from "../../utils/date";

type CommentItemProps = {
  comment: Comment;
  onLike?: (comment: Comment) => void;
  onReply?: (comment: Comment) => void;
  onMore?: (comment: Comment) => void;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function CommentItem({ comment, onLike, onReply, onMore }: CommentItemProps) {
  const theme = useTheme();
  const actionColor = comment.liked ? theme.colors.primary : theme.colors.onSurfaceVariant;

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
          label={getInitials(comment.author)}
          color="#FFFFFF"
          style={[
            globalStyles.commentAvatar,
            { backgroundColor: comment.avatarColor ?? theme.colors.primary },
          ]}
          labelStyle={{ fontSize: 14, fontWeight: "700" }}
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
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`More options for ${comment.author}'s comment`}
            onPress={() => onMore?.(comment)}
            style={globalStyles.commentMoreButton}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
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
            <Text style={[globalStyles.commentActionText, { color: actionColor }]}>
              {comment.likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Reply to ${comment.author}`}
            onPress={() => onReply?.(comment)}
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
          {comment.replies > 0 ? (
            <Text style={[globalStyles.commentActionText, { color: theme.colors.primary }]}>
              {comment.replies} {comment.replies === 1 ? "reply" : "replies"}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
