import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useDispatch } from "react-redux";
import { postsApi, useReportPostMutation } from "../features/posts/api";
import { isNotFoundError, removePostFromCaches } from "../features/posts/utils";
import { Post, PostReportReason } from "../features/posts/types";
import { useUnfollowAuthor } from "./useUnfollowAuthor";

export function useReportPost() {
  const dispatch = useDispatch();
  const [reportPost] = useReportPostMutation();
  const unfollowAuthor = useUnfollowAuthor();
  const [reportTarget, setReportTarget] = useState<Post | null>(null);

  const openReport = useCallback((post: Post) => {
    // Delay slightly to let the three-dot menu modal finish dismissing on iOS
    setTimeout(() => {
      setReportTarget(post);
    }, 100);
  }, []);

  const closeReport = useCallback(() => {
    setReportTarget(null);
  }, []);

  const submitReport = useCallback(
    async (reason: PostReportReason) => {
      const targetPost = reportTarget;
      if (!targetPost) {
        return;
      }
      setReportTarget(null);

      // Optimistically remove the reported post from feed and public posts caches
      const undoRemove = removePostFromCaches(postsApi, dispatch, targetPost.id);

      try {
        await reportPost({ postId: targetPost.id, reason }).unwrap();

        // If the post has an author, prompt user whether they also wish to unfollow
        if (targetPost.authorId) {
          Alert.alert(
            "Report submitted",
            `Thanks for helping to keep Tsiyon safe. Would you also like to unfollow ${targetPost.author}?`,
            [
              { text: "Not now", style: "cancel" },
              {
                text: "Unfollow",
                style: "destructive",
                onPress: () => unfollowAuthor(targetPost),
              },
            ]
          );
        } else {
          Alert.alert("Report submitted", "Thanks for helping keep Zion safe.");
        }
      } catch (error: unknown) {
        if (isNotFoundError(error)) {
          // Post is already deleted/gone on backend, keep it removed from feed
          Alert.alert("Post unavailable", "This post is no longer available.");
          return;
        }

        // Revert cache on other errors (e.g. network failure)
        undoRemove();
        Alert.alert("Error", "Could not submit report. Please try again.");
      }
    },
    [dispatch, reportPost, reportTarget, unfollowAuthor]
  );

  return {
    reportTarget,
    openReport,
    closeReport,
    submitReport,
  };
}

