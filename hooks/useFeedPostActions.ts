import { useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import {
  useToggleLikePostMutation,
  useToggleRepostPostMutation,
  useToggleBookmarkPostMutation,
  useDeletePostMutation,
} from "../features/posts/api";
import { Post } from "../features/posts/types";
import { FeedPostActions } from "../components/Posts/Feed/types";

export function useFeedPostActions(): FeedPostActions {
  const router = useRouter();
  const [toggleLikePost] = useToggleLikePostMutation();
  const [toggleRepostPost] = useToggleRepostPostMutation();
  const [toggleBookmarkPost] = useToggleBookmarkPostMutation();
  const [deletePost] = useDeletePostMutation();

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

  return useMemo(
    () => ({
      onLike: handleLike,
      onComment: handleComment,
      onRepost: handleRepost,
      onBookmark: handleBookmark,
      onEdit: handleEdit,
      onDelete: handleDelete,
    }),
    [
      handleLike,
      handleComment,
      handleRepost,
      handleBookmark,
      handleEdit,
      handleDelete,
    ]
  );
}

