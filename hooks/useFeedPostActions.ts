import { useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import {
  postsApi,
  useToggleLikePostMutation,
  useToggleRepostPostMutation,
  useToggleBookmarkPostMutation,
  useDeletePostMutation,
} from "../features/posts/api";
import { useUnfollowUserMutation } from "../features/users/api";
import { removeAuthorPostsFromFeed } from "../features/posts/utils";
import { Post } from "../features/posts/types";
import { FeedPostActions } from "../components/Posts/Feed/types";

export function useFeedPostActions(): FeedPostActions {
  const router = useRouter();
  const dispatch = useDispatch();
  const [toggleLikePost] = useToggleLikePostMutation();
  const [toggleRepostPost] = useToggleRepostPostMutation();
  const [toggleBookmarkPost] = useToggleBookmarkPostMutation();
  const [deletePost] = useDeletePostMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const handleLike = useCallback(
    (post: Post) => {
      toggleLikePost({
        postId: post.id,
        liked: !!post.liked,
      });
    },
    [toggleLikePost]
  );

  const handleComment = useCallback(
    (postId: string) => {
      router.push({
        pathname: "/posts/[postId]/PostComments",
        params: { postId },
      });
    },
    [router]
  );

  const handleRepost = useCallback(
    (post: Post) => {
      toggleRepostPost({
        postId: post.id,
        reposted: !!post.isReposted,
      });
    },
    [toggleRepostPost]
  );

  const handleBookmark = useCallback(
    (post: Post) => {
      toggleBookmarkPost({
        postId: post.id,
        bookmarked: Boolean(post.isBookmarked ?? post.bookmarked),
      });
    },
    [toggleBookmarkPost]
  );

  const handleEdit = useCallback(
    (postId: string) => {
      router.push({
        pathname: "/posts/[postId]/edit",
        params: { postId },
      });
    },
    [router]
  );

  const handleDelete = useCallback(
    (postId: string) => {
      // Delay alert slightly so the menu modal finishes its dismissal animation on iOS
      setTimeout(() => {
        Alert.alert(
          "Delete Post?",
          "Are you sure you want to delete this post? This action cannot be undone.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                try {
                  await deletePost(postId).unwrap();
                } catch {
                  Alert.alert(
                    "Error",
                    "Failed to delete post. Please try again."
                  );
                }
              },
            },
          ]
        );
      }, 100);
    },
    [deletePost]
  );

  const handleFollowToggle = useCallback(
    (post: Post) => {
      const targetUserId = post.authorId;
      if (!targetUserId) {
        return;
      }

      // Delay alert slightly so the menu modal finishes its dismissal animation on iOS
      setTimeout(() => {
        Alert.alert(
          `Unfollow ${post.author}?`,
          `You will no longer see posts from ${post.author} in your feed.`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Unfollow",
              style: "destructive",
              onPress: async () => {
                const undoRemove = removeAuthorPostsFromFeed(
                  postsApi,
                  dispatch,
                  targetUserId
                );
                try {
                  await unfollowUser({ userId: String(targetUserId) }).unwrap();
                } catch {
                  undoRemove();
                  Alert.alert(
                    "Error",
                    `Failed to unfollow ${post.author}. Please try again.`
                  );
                }
              },
            },
          ]
        );
      }, 100);
    },
    [dispatch, unfollowUser]
  );

  return useMemo(
    () => ({
      onLike: handleLike,
      onComment: handleComment,
      onRepost: handleRepost,
      onBookmark: handleBookmark,
      onEdit: handleEdit,
      onDelete: handleDelete,
      onFollowToggle: handleFollowToggle,
    }),
    [
      handleLike,
      handleComment,
      handleRepost,
      handleBookmark,
      handleEdit,
      handleDelete,
      handleFollowToggle,
    ]
  );
}

