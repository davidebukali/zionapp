import React from "react";
import PostCard from "../PostCard";
import { FeedPostItemProps } from "./types";
import { isPostOwnedBy, resolveActivityActor } from "../../../features/posts/utils";

export const FeedPostItem = React.memo(function FeedPostItem({
  post,
  currentUser,
  actions,
}: FeedPostItemProps) {
  const isOwnPost = isPostOwnedBy(post, currentUser);
  const resolvedActor = resolveActivityActor(post.activityActor, currentUser?.name);

  return (
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
      isFollowingAuthor={!isOwnPost}
      activityType={post.activityType}
      activityActor={resolvedActor}
      onLike={() => actions.onLike(post)}
      onComment={() => actions.onComment(post.id)}
      onPressRepost={() => actions.onRepost(post)}
      onPressBookmark={() => actions.onBookmark(post)}
      onPressEdit={() => actions.onEdit(post.id)}
      onPressDelete={() => actions.onDelete(post.id)}
      onPressFollowToggle={() => actions.onFollowToggle?.(post)}
      onPressReport={() => actions.onReport?.(post)}
    />
  );
});

