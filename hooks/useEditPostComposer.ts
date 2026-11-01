import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";

import {
  useGetPostQuery,
  useUpdatePostMutation,
  useGetMediaUploadUrlMutation,
  useConfirmMediaUploadMutation,
  useLazyGetMediaStatusQuery,
} from "../features/posts/api";
import { MediaItem, uploadAndProcessMedia } from "../utils/mediaUploader";
import { useComposerCore } from "./useComposerCore";

export function useEditPostComposer(postId: string) {
  const { data: post, isLoading: isLoadingPost } = useGetPostQuery(postId, {
    skip: !postId,
  });

  const composer = useComposerCore();
  const { content, setContent, mediaItems, setMediaItems, hasContent } = composer;

  const [isSaving, setIsSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  const initialContentRef = useRef("");
  const initialMediaIdsRef = useRef<string[]>([]);
  const isInitializedRef = useRef(false);

  // Populate draft once the post data is fetched
  useEffect(() => {
    if (post && !isInitializedRef.current) {
      isInitializedRef.current = true;
      const initialText = post.content || "";
      setContent(initialText);
      initialContentRef.current = initialText;

      const existingMedia: MediaItem[] = [];
      if (post.media && post.media.length > 0) {
        post.media.forEach((m) => {
          if (m.url) {
            existingMedia.push({ id: m.id, uri: m.url });
          }
        });
      } else if (post.imageUrl) {
        existingMedia.push({ uri: post.imageUrl });
      }

      setMediaItems(existingMedia);
      initialMediaIdsRef.current = existingMedia
        .map((m) => m.id || m.uri)
        .filter(Boolean);
    }
  }, [post, setContent, setMediaItems]);

  const [updatePost] = useUpdatePostMutation();
  const [getMediaUploadUrl] = useGetMediaUploadUrlMutation();
  const [confirmMediaUpload] = useConfirmMediaUploadMutation();
  const [getMediaStatus] = useLazyGetMediaStatusQuery();

  // Dirty check against initial values
  const isDirty = useMemo(() => {
    if (content !== initialContentRef.current) return true;
    const currentIds = mediaItems.map((m) => m.id || m.uri);
    if (currentIds.length !== initialMediaIdsRef.current.length) return true;
    return currentIds.some((id, idx) => id !== initialMediaIdsRef.current[idx]);
  }, [content, mediaItems]);

  const handleClose = useCallback(() => {
    if (isDirty) {
      Alert.alert(
        "Discard changes?",
        "Any unsaved edits will be lost.",
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
  }, [isDirty]);

  const handleSave = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed && mediaItems.length === 0) {
      Alert.alert("Empty Post", "A post must contain either text or at least one image.");
      return;
    }

    setIsSaving(true);
    try {
      // Preserve IDs of existing media attachments
      const existingMediaIds = mediaItems
        .filter((item) => Boolean(item.id))
        .map((item) => item.id!);

      // Upload and verify any newly selected media files
      const newMediaToUpload = mediaItems.filter((item) => !item.id);
      let newlyUploadedIds: string[] = [];

      if (newMediaToUpload.length > 0) {
        newlyUploadedIds = await uploadAndProcessMedia(
          newMediaToUpload,
          { getMediaUploadUrl, confirmMediaUpload, getMediaStatus },
          setSavingStatus
        );
      }

      setSavingStatus("Saving...");
      const finalMediaIds = [...existingMediaIds, ...newlyUploadedIds];

      await updatePost({
        postId,
        content: trimmed,
        media_ids: finalMediaIds,
      }).unwrap();

      router.back();
    } catch (error: any) {
      console.error("Failed to update post:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to update post. Please try again.";
      Alert.alert("Update Error", errorMessage);
    } finally {
      setIsSaving(false);
      setSavingStatus(null);
    }
  }, [
    confirmMediaUpload,
    content,
    getMediaStatus,
    getMediaUploadUrl,
    mediaItems,
    postId,
    updatePost,
  ]);

  const isSaveDisabled = isSaving || !hasContent;

  return {
    ...composer,
    isSaving,
    savingStatus,
    handleSave,
    handleClose,
    isSaveDisabled,
    isLoadingPost,
  };
}
