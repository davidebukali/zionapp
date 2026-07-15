import Ionicons from "@expo/vector-icons/Ionicons";
import { ImageSourcePropType, Text, TouchableOpacity, View } from "react-native";
import { Avatar, Card, useTheme } from "react-native-paper";

import { globalStyles, postTokens } from "../../assets/styles/theme";
import { PostAction } from "./PostAction";

interface PostCardProps {
  title: string;
  subtitle: string;
  body?: string;
  avatarUrl?: string;
  imageUrl?: string;
  imageSource?: ImageSourcePropType;
  likes?: string;
  comments?: string;
  liked?: boolean;
}

const fallbackAvatar =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80";

const defaultBody =
  "Just finished drafting the new visual direction for the design system. We're prioritizing high-contrast bold elements and deep emotional minimalism. Can't wait to share more!";

const PostCard = ({
  title,
  subtitle,
  body = defaultBody,
  avatarUrl = fallbackAvatar,
  imageUrl,
  imageSource,
  likes = "1.2k",
  comments = "48",
  liked = false,
}: PostCardProps) => {
  const theme = useTheme();
  const mediaSource = imageSource ?? (imageUrl ? { uri: imageUrl } : undefined);
  const actionColor = liked ? postTokens.activeActionColor : postTokens.actionColor;

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
        subtitle={subtitle}
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
        left={(props) => (
          <Avatar.Image
            {...props}
            size={54}
            source={{ uri: avatarUrl }}
            style={globalStyles.postAvatar}
          />
        )}
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

      {!mediaSource ? (
        <Card.Content style={globalStyles.postBodyContent}>
          <Text style={[globalStyles.postBodyText, { color: theme.colors.onSurface }]}>
            {body}
          </Text>
        </Card.Content>
      ) : null}

      {mediaSource ? (
        <>
          <Card.Cover source={mediaSource} style={globalStyles.postMedia} />
          {body ? (
            <Card.Content style={globalStyles.postCaptionContent}>
              <Text
                style={[
                  globalStyles.postCaptionText,
                  { color: theme.colors.onSurface },
                ]}
              >
                {body}
              </Text>
            </Card.Content>
          ) : null}
        </>
      ) : null}

      <Card.Actions style={globalStyles.postFooter}>
        <View style={globalStyles.postActionGroup}>
          <PostAction
            icon={liked ? "heart" : "heart-outline"}
            label={likes}
            color={actionColor}
            accessibilityLabel={`${likes} likes`}
          />
          <PostAction
            icon="chatbox-outline"
            label={comments}
            color={postTokens.actionColor}
            accessibilityLabel={`${comments} comments`}
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
