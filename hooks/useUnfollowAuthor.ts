import { useCallback } from "react";
import { Alert } from "react-native";
import { useDispatch } from "react-redux";
import { postsApi } from "../features/posts/api";
import { useUnfollowUserMutation } from "../features/users/api";
import { removeAuthorPostsFromFeed } from "../features/posts/utils";
import { Post } from "../features/posts/types";

export function useUnfollowAuthor() {
  const dispatch = useDispatch();
  const [unfollowUser] = useUnfollowUserMutation();

  return useCallback(
    async (post: Post) => {
      const targetUserId = post.authorId;
      if (!targetUserId) {
        return;
      }

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
    [dispatch, unfollowUser]
  );
}

