import { useState, useMemo } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { EmojiType } from "rn-emoji-keyboard";

import { RootState } from "../store/store";
import {
  useGetMediaUploadUrlMutation,
  useConfirmMediaUploadMutation,
  useLazyGetMediaStatusQuery,
  useCreatePostMutation,
} from "../features/posts/api";
import { MAX_CHARACTERS, MAX_MEDIA } from "../constants";
import {
  MediaItem,
  uploadAndProcessMedia,
} from "../utils/mediaUploader";

export type { MediaItem };

/**
 * Custom hook orchestrating the Create Post composer UI state,
 * media picker, review modal, and publish pipeline.
 */
export function useCreatePostComposer() {
  // ---------------------------------------------------------------------------
  // 1. Core State
  // ---------------------------------------------------------------------------
  const [content, setContent] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const [isPosting, setIsPosting] = useState(false);
  const [postingStatus, setPostingStatus] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // 2. API Mutations & Selectors
  // ---------------------------------------------------------------------------
  const [getMediaUploadUrl] = useGetMediaUploadUrlMutation();
  const [confirmMediaUpload] = useConfirmMediaUploadMutation();
  const [getMediaStatus] = useLazyGetMediaStatusQuery();
  const [createPost] = useCreatePostMutation();

  const user = useSelector((state: RootState) => state.auth.user);

  // ---------------------------------------------------------------------------
  // 3. User Avatar & Initials (Memoized)
  // ---------------------------------------------------------------------------
  const initials = useMemo(() => {
    if (user?.name) {
      const parts = user.name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "AR";
  }, [user?.name, user?.email]);

  // ---------------------------------------------------------------------------
  // 4. Draft & Dismissal Handlers
  // ---------------------------------------------------------------------------
  const handleClose = () => {
    const hasDraft = content.trim().length > 0 || mediaItems.length > 0;
    if (hasDraft) {
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
  };

  // ---------------------------------------------------------------------------
  // 5. Media Selection & Review Modal Handlers
  // ---------------------------------------------------------------------------
  const pickMedia = async () => {
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
  };

  const removeAllMedia = () => {
    setMediaItems([]);
  };

  /**
   * Deletes the currently reviewed item without triggering nested state updater side-effects.
   */
  const deleteReviewItem = () => {
    const updated = mediaItems.filter((_, idx) => idx !== reviewIndex);
    setMediaItems(updated);

    if (updated.length === 0) {
      setIsReviewModalVisible(false);
      setReviewIndex(0);
    } else if (reviewIndex >= updated.length) {
      setReviewIndex(updated.length - 1);
    }
  };

  const openReviewModal = (initialIndex = 0) => {
    setReviewIndex(initialIndex);
    setIsReviewModalVisible(true);
  };

  // ---------------------------------------------------------------------------
  // 6. Text & Emoji Handlers
  // ---------------------------------------------------------------------------
  const handleEmojiSelected = (emojiObject: EmojiType) => {
    setContent((prev) => (prev + emojiObject.emoji).slice(0, MAX_CHARACTERS));
  };

  // ---------------------------------------------------------------------------
  // 7. Post Publishing Pipeline
  // ---------------------------------------------------------------------------
  const handlePublish = async () => {
    if (!content.trim() && mediaItems.length === 0) {
      Alert.alert("Empty Post", "Please write some text or attach an image.");
      return;
    }

    setIsPosting(true);
    try {
      // Step 1: Upload and verify media attachments via pipeline utility
      const mediaIds = await uploadAndProcessMedia(
        mediaItems,
        { getMediaUploadUrl, confirmMediaUpload, getMediaStatus },
        setPostingStatus
      );

      // Step 2: Finalize post creation
      setPostingStatus("Posting...");
      await createPost({
        content: content.trim(),
        ...(mediaIds.length > 0 ? { media_ids: mediaIds } : {}),
      }).unwrap();

      router.back();
    } catch (error: any) {
      console.error("Failed to create post:", error);
      const errorMessage =
        error?.data?.message || error?.message || "Failed to create post. Please try again.";
      Alert.alert("Post Creation Error", errorMessage);
    } finally {
      setIsPosting(false);
      setPostingStatus(null);
    }
  };

  // ---------------------------------------------------------------------------
  // 8. Computed Values & Return Object
  // ---------------------------------------------------------------------------
  const remainingChars = MAX_CHARACTERS - content.length;
  const isPostDisabled = isPosting || (!content.trim() && mediaItems.length === 0);

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
    isPosting,
    postingStatus,
    handlePublish,
    handleClose,
    remainingChars,
    isPostDisabled,
    initials,
  };
}
