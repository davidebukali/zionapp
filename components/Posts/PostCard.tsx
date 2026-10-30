import React, { useCallback } from "react";
import { Share } from "react-native";
import { Card, useTheme } from "react-native-paper";

import { globalStyles } from "../../assets/styles/theme";
import {
  PostCardBody,
  PostCardFooter,
  PostCardHeader,
  PostCardProps,
} from "./Card";

export function PostCard({
  title,
  createdAt,
  body,
  avatarUrl,
  imageUrl,
  mediaWidth,
  mediaHeight,
  imageSource,
  likes,
  comments,
  liked = false,
  bookmarked = false,
  isOwnPost = false,
  isFollowingAuthor = false,
  isReposted = false,
  repostsCount = 0,
  activityType,
  activityActor,
  activity,
  onLike,
  onComment,
  onPressThreeDots,
  onPressEdit,
  onPressDelete,
  onPressFollowToggle,
  onPressReport,
  onPressLike,
  onPressComment,
  onPressRepost,
  onPressBookmark,
  onPressShareDM,
  onPressShareSystem,
}: PostCardProps) {
  const theme = useTheme();

  const handleShareSystem = useCallback(async () => {
    onPressShareSystem?.();
    setTimeout(async () => {
      try {
        const shareText =
          [title, body].filter(Boolean).join("\n\n") || "Check out this post on Zion";
        await Share.share(
          imageUrl && imageUrl.startsWith("http")
            ? {
                title: title || "Share Post",
                message: shareText,
                url: imageUrl,
              }
            : {
                title: title || "Share Post",
                message: shareText,
              }
        );
      } catch {
        // User dismissed or share error
      }
    }, 100);
  }, [onPressShareSystem, title, body, imageUrl]);

  const resolvedActivityType = activityType ?? activity?.type;
  const resolvedActivityActor = activityActor ?? activity?.actor?.name;

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
      <PostCardHeader
        title={title}
        createdAt={createdAt}
        avatarUrl={avatarUrl}
        isOwnPost={isOwnPost}
        isFollowingAuthor={isFollowingAuthor}
        activityType={resolvedActivityType}
        activityActor={resolvedActivityActor}
        onPressThreeDots={onPressThreeDots}
        onPressEdit={onPressEdit}
        onPressDelete={onPressDelete}
        onPressFollowToggle={onPressFollowToggle}
        onPressReport={onPressReport}
        onPressShareDM={onPressShareDM}
        onPressShareSystem={handleShareSystem}
      />

      <PostCardBody
        body={body}
        imageUrl={imageUrl}
        mediaWidth={mediaWidth}
        mediaHeight={mediaHeight}
        imageSource={imageSource}
      />

      <PostCardFooter
        likes={likes}
        comments={comments}
        liked={liked}
        isReposted={isReposted}
        repostsCount={repostsCount}
        bookmarked={bookmarked}
        onPressLike={onPressLike ?? onLike}
        onPressComment={onPressComment ?? onComment}
        onPressRepost={onPressRepost}
        onPressBookmark={onPressBookmark}
      />
    </Card>
  );
}

export default PostCard;
export * from "./Card/types";
