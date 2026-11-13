import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

import {
  useGetMediaUploadUrlMutation,
  useConfirmMediaUploadMutation,
  useLazyGetMediaStatusQuery,
  useCreatePostMutation,
} from "../features/posts/api";
import { PostVisibility } from "../features/posts/types";
import { MediaItem, uploadAndProcessMedia } from "../utils/mediaUploader";
import { CrashlyticsService } from "../services/crashlytics";
import { useComposerCore } from "./useComposerCore";

export type { MediaItem };

const POST_VISIBILITY_KEY = "preferred_post_visibility";

/**
 * Custom hook orchestrating the Create Post composer UI state,
 * media picker, review modal, and publish pipeline.
 */
export function useCreatePostComposer() {
  const composer = useComposerCore();
  const { content, mediaItems, hasContent, taggedUserIds } = composer;

  const [isPosting, setIsPosting] = useState(false);
  const [postingStatus, setPostingStatus] = useState<string | null>(null);
  const [visibility, setVisibilityState] = useState<PostVisibility>("public");

  useEffect(() => {
    let isMounted = true;
    SecureStore.getItemAsync(POST_VISIBILITY_KEY)
      .then((saved) => {
        if (isMounted && (saved === "public" || saved === "followers")) {
          setVisibilityState(saved);
        }
      })
      .catch((err) => {
        console.warn("Failed to load preferred post visibility:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const setVisibility = useCallback((newVisibility: PostVisibility) => {
    setVisibilityState(newVisibility);
    SecureStore.setItemAsync(POST_VISIBILITY_KEY, newVisibility).catch((err) => {
      console.warn("Failed to persist preferred post visibility:", err);
    });
  }, []);

  const [getMediaUploadUrl] = useGetMediaUploadUrlMutation();
  const [confirmMediaUpload] = useConfirmMediaUploadMutation();
  const [getMediaStatus] = useLazyGetMediaStatusQuery();
  const [createPost] = useCreatePostMutation();

  const handleClose = useCallback(() => {
    if (hasContent) {
      Alert.alert(
        "Discard post?",
        "Your draft will be lost if you leave.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  }, [hasContent]);

  const handlePublish = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed && mediaItems.length === 0) {
      Alert.alert("Empty Post", "Please write some text or attach an image.");
      return;
    }

    setIsPosting(true);
    try {
      const mediaIds = await uploadAndProcessMedia(
        mediaItems,
        { getMediaUploadUrl, confirmMediaUpload, getMediaStatus },
        setPostingStatus
      );

      setPostingStatus("Posting...");
      await createPost({
        content: trimmed,
        visibility,
        ...(mediaIds.length > 0 ? { media_ids: mediaIds } : {}),
        ...(taggedUserIds.length > 0 ? { tagged_user_ids: taggedUserIds } : {}),
      }).unwrap();

      router.back();
    } catch (error: any) {
      console.error("Failed to create post:", error);
      CrashlyticsService.recordError(error, "CreatePostFailure");
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to create post. Please try again.";
      Alert.alert("Post Creation Error", errorMessage);
    } finally {
      setIsPosting(false);
      setPostingStatus(null);
    }
  }, [
    confirmMediaUpload,
    content,
    createPost,
    getMediaStatus,
    getMediaUploadUrl,
    mediaItems,
    taggedUserIds,
    visibility,
  ]);

  const isPostDisabled = isPosting || !hasContent;

  return {
    ...composer,
    visibility,
    setVisibility,
    isPosting,
    postingStatus,
    handlePublish,
    handleClose,
    isPostDisabled,
  };
}
