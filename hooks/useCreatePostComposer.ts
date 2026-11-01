import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";

import {
  useGetMediaUploadUrlMutation,
  useConfirmMediaUploadMutation,
  useLazyGetMediaStatusQuery,
  useCreatePostMutation,
} from "../features/posts/api";
import { MediaItem, uploadAndProcessMedia } from "../utils/mediaUploader";
import { useComposerCore } from "./useComposerCore";

export type { MediaItem };

/**
 * Custom hook orchestrating the Create Post composer UI state,
 * media picker, review modal, and publish pipeline.
 */
export function useCreatePostComposer() {
  const composer = useComposerCore();
  const { content, mediaItems, hasContent } = composer;

  const [isPosting, setIsPosting] = useState(false);
  const [postingStatus, setPostingStatus] = useState<string | null>(null);

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
        ...(mediaIds.length > 0 ? { media_ids: mediaIds } : {}),
      }).unwrap();

      router.back();
    } catch (error: any) {
      console.error("Failed to create post:", error);
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
  ]);

  const isPostDisabled = isPosting || !hasContent;

  return {
    ...composer,
    isPosting,
    postingStatus,
    handlePublish,
    handleClose,
    isPostDisabled,
  };
}
