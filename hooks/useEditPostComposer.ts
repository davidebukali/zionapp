import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { EmojiType } from "rn-emoji-keyboard";

import { RootState } from "../store/store";
import {
  useGetPostQuery,
  useUpdatePostMutation,
  useGetMediaUploadUrlMutation,
  useConfirmMediaUploadMutation,
  useLazyGetMediaStatusQuery,
} from "../features/posts/api";
import { MAX_CHARACTERS, MAX_MEDIA } from "../constants";
import { MediaItem, uploadAndProcessMedia } from "../utils/mediaUploader";
import { getUserInitials, getUserAvatarUrl } from "../utils/user";

export function useEditPostComposer(postId: string) {
  const { data: post, isLoading: isLoadingPost } = useGetPostQuery(postId, {
    skip: !postId,
  });

  const [content, setContent] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
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
  }, [post]);

  const [updatePost] = useUpdatePostMutation();
  const [getMediaUploadUrl] = useGetMediaUploadUrlMutation();
  const [confirmMediaUpload] = useConfirmMediaUploadMutation();
  const [getMediaStatus] = useLazyGetMediaStatusQuery();

  const user = useSelector((state: RootState) => state.auth.user);
  const initials = useMemo(
    () => getUserInitials(user?.name, user?.email),
    [user?.name, user?.email]
  );
  const avatarUrl = useMemo(() => getUserAvatarUrl(user), [user]);

  // Dirty check
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

  const pickMedia = useCallback(async () => {
    if (mediaItems.length >= MAX_MEDIA) {
      Alert.alert("Limit Reached", `You can attach up to ${MAX_MEDIA} images.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Photo library access is needed to add photos to your post."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: MAX_MEDIA - mediaItems.length,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newItems: MediaItem[] = result.assets.map((asset) => ({
        uri: asset.uri,
        filename: asset.fileName || undefined,
        mimeType: asset.mimeType || undefined,
        fileSize: asset.fileSize || undefined,
      }));
      setMediaItems((prev) => [...prev, ...newItems].slice(0, MAX_MEDIA));
    }
  }, [mediaItems.length]);

  const removeAllMedia = useCallback(() => {
    setMediaItems([]);
  }, []);

  const deleteReviewItem = useCallback(() => {
    setMediaItems((prev) => {
      const updated = prev.filter((_, idx) => idx !== reviewIndex);
      if (updated.length === 0) {
        setIsReviewModalVisible(false);
        setReviewIndex(0);
      } else if (reviewIndex >= updated.length) {
        setReviewIndex(updated.length - 1);
      }
      return updated;
    });
  }, [reviewIndex]);

  const openReviewModal = useCallback((initialIndex = 0) => {
    setReviewIndex(initialIndex);
    setIsReviewModalVisible(true);
  }, []);

  const handleEmojiSelected = useCallback((emojiObject: EmojiType) => {
    setContent((prev) => (prev + emojiObject.emoji).slice(0, MAX_CHARACTERS));
  }, []);

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

  const remainingChars = MAX_CHARACTERS - content.length;
  const isSaveDisabled =
    isSaving || (!content.trim() && mediaItems.length === 0);

  return {
    content,
    setContent,
    mediaItems,
    pickMedia,
    removeAllMedia,
    deleteReviewItem,
    isReviewModalVisible,
    setIsReviewModalVisible,
    reviewIndex,
    setReviewIndex,
    openReviewModal,
    isEmojiPickerOpen,
    setIsEmojiPickerOpen,
    handleEmojiSelected,
    isSaving,
    savingStatus,
    handleSave,
    handleClose,
    remainingChars,
    isSaveDisabled,
    initials,
    avatarUrl,
    isLoadingPost,
  };
}

