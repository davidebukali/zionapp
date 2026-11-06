import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import { PostCard } from "../PostCard";
import { Post } from "../../../features/posts/types";
import { FeedPostActions } from "../Feed/types";
import { globalStyles } from "../../../assets/styles/theme";

interface PostDetailHeaderProps {
  post?: Post | null;
  isOwnPost: boolean;
  resolvedActor?: string;
  actions: FeedPostActions;
  onPressImage?: (url: string) => void;
  onPressImageIndex?: (index: number) => void;
}

export const PostDetailHeader = React.memo(function PostDetailHeader({
  post,
  isOwnPost,
  resolvedActor,
  actions,
  onPressImage,
  onPressImageIndex,
}: PostDetailHeaderProps) {
  const theme = useTheme();

  if (!post) return null;

  return (
    <View style={styles.postHeaderWrapper}>
      <PostCard
        title={post.title}
        createdAt={post.createdAt}
        body={post.content}
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
        isFollowingAuthor={!isOwnPost}
        activityType={post.activityType}
        activityActor={resolvedActor}
        onLike={() => actions.onLike(post)}
        onPressRepost={() => actions.onRepost(post)}
        onPressBookmark={() => actions.onBookmark(post)}
        onPressEdit={() => actions.onEdit(post.id)}
        onPressDelete={() => actions.onDelete(post.id)}
        onPressFollowToggle={() => actions.onFollowToggle?.(post)}
        onPressReport={() => actions.onReport?.(post)}
        onPressImage={
          onPressImage && post.imageUrl
            ? () => onPressImage(post.imageUrl!)
            : onPressImageIndex
            ? () => onPressImageIndex(0)
            : undefined
        }
        onPressImageIndex={onPressImageIndex}
      />
      <View
        style={[
          styles.commentsSectionDivider,
          { borderBottomColor: theme.colors.outlineVariant },
        ]}
      >
        <Text
          style={[
            globalStyles.commentsHeaderTitle,
            styles.sectionTitle,
            { color: theme.colors.onSurface },
          ]}
        >
          Comments
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  postHeaderWrapper: {
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  commentsSectionDivider: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
});
