import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, ImageSourcePropType, Text, TouchableOpacity, View } from "react-native";
import { Avatar, Card, useTheme } from "react-native-paper";

import { globalStyles, postTokens } from "../../assets/styles/theme";
import { formatRelativeTime } from "../../utils/date";
import { PostAction } from "./PostAction";

interface PostCardProps {
  title: string;
  createdAt: string | Date;
  body?: string;
  avatarUrl?: string;
  imageUrl?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  imageSource?: ImageSourcePropType;
  likes?: string;
  comments?: string;
  liked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
}

const getInitials = (name?: string): string => {
  if (!name) return "AR";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const PostCard = ({
  title,
  createdAt,
  body,
  avatarUrl,
  imageUrl,
  mediaWidth,
  mediaHeight,
  imageSource,
  likes = "",
  comments = "",
  liked = false,
  onLike,
  onComment,
}: PostCardProps) => {
  const theme = useTheme();
  const mediaSource = imageSource ?? (imageUrl ? { uri: imageUrl } : undefined);
  const actionColor = liked ? postTokens.activeActionColor : postTokens.actionColor;

  // Adaptive aspect ratio clamped between 4:5 (0.8 portrait) and 16:9 (1.78 landscape)
  const rawRatio =
    mediaWidth && mediaHeight ? mediaWidth / mediaHeight : postTokens.imageAspectRatio;
  const clampedAspectRatio = Math.max(0.8, Math.min(1.78, rawRatio));

  return (
    <Card
      mode="contained"
      style={[
        globalStyles.postCard,
        globalStyles.postCardShadow,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      <Card.Title
        title={title}
        subtitle={formatRelativeTime(createdAt)}
        titleNumberOfLines={1}
        subtitleNumberOfLines={1}
        style={globalStyles.postTitle}
        titleStyle={[
          globalStyles.postAuthorText,
          { color: theme.colors.onSurface },
        ]}
        subtitleStyle={[
          globalStyles.postTimestampText,
          { color: theme.colors.onSurfaceVariant },
        ]}
        left={(props) =>
          avatarUrl ? (
            <Avatar.Image
              {...props}
              size={54}
              source={{ uri: avatarUrl }}
              style={globalStyles.postAvatar}
            />
          ) : (
            <Avatar.Text
              {...props}
              size={54}
              label={getInitials(title)}
              color={theme.colors.onPrimaryContainer}
              style={[
                globalStyles.postAvatar,
                {
                  paddingRight: 0,
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
              labelStyle={{ fontSize: 18, fontWeight: "700" }}
            />
          )
        }
        right={() => (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="More post options"
            hitSlop={12}
            style={globalStyles.postIconButton}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={26}
              color={postTokens.actionColor}
            />
          </TouchableOpacity>
        )}
        rightStyle={globalStyles.postTitleRight}
      />

      {/* 1. Body Text (Appears before image, at the top) */}
      {body ? (
        <Card.Content
          style={[
            globalStyles.postBodyContent,
            mediaSource ? { paddingBottom: 12 } : null,
          ]}
        >
          <Text style={[globalStyles.postBodyText, { color: theme.colors.onSurface }]}>
            {body}
          </Text>
        </Card.Content>
      ) : null}

      {/* 2. Media: Edge-to-edge full width with adaptive ratio */}
      {mediaSource ? (
        <View style={{ width: "100%", overflow: "hidden" }}>
          <Image
            source={mediaSource}
            style={{
              width: "100%",
              aspectRatio: clampedAspectRatio,
            }}
            resizeMode="cover"
          />
        </View>
      ) : null}

      <Card.Actions style={globalStyles.postFooter}>
        <View style={globalStyles.postActionGroup}>
          <PostAction
            icon={liked ? "heart" : "heart-outline"}
            label={likes}
            color={actionColor}
            accessibilityLabel={`${likes} likes`}
            onPress={onLike}
          />
          <PostAction
            icon="chatbox-outline"
            label={comments}
            color={postTokens.actionColor}
            accessibilityLabel={`${comments} comments`}
            onPress={onComment}
          />
          <PostAction
            icon="share-social-outline"
            color={postTokens.actionColor}
            accessibilityLabel="Share post"
          />
        </View>

        <PostAction
          icon="bookmark-outline"
          color={postTokens.actionColor}
          accessibilityLabel="Save post"
        />
      </Card.Actions>
    </Card>
  );
};

export default PostCard;
