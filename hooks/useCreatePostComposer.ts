import { useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { EmojiType } from "rn-emoji-keyboard";

import { RootState } from "../store/store";
import {
  useGetMediaUploadUrlMutation,
  useConfirmMediaUploadMutation,
  useCreatePostMutation,
} from "../features/posts/api";

const MAX_CHARACTERS = 3000;
const MAX_MEDIA = 10;

export interface MediaItem {
  uri: string;
  filename?: string;
  mimeType?: string;
  fileSize?: number;
}

// Helper: Resolve valid MIME type for upload
function getMimeType(uri: string, rawMime?: string): string {
  if (rawMime && ["image/jpeg", "image/png", "image/webp"].includes(rawMime)) {
    return rawMime;
  }
  const ext = uri.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

function getFilename(uri: string, rawName?: string): string {
  if (rawName) return rawName;
  const parts = uri.split("/");
  return parts[parts.length - 1] || "photo.jpg";
}

export function useCreatePostComposer() {
  const [content, setContent] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const [isPosting, setIsPosting] = useState(false);
  const [postingStatus, setPostingStatus] = useState<string | null>(null);

  const [getMediaUploadUrl] = useGetMediaUploadUrlMutation();
  const [confirmMediaUpload] = useConfirmMediaUploadMutation();
  const [createPost] = useCreatePostMutation();

  const user = useSelector((state: RootState) => state.auth.user);

  const getInitials = () => {
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
  };

  const handleClose = () => {
    if (content.trim().length > 0 || mediaItems.length > 0) {
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

  const deleteReviewItem = () => {
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
  };

  const openReviewModal = (initialIndex = 0) => {
    setReviewIndex(initialIndex);
    setIsReviewModalVisible(true);
  };

  const handleEmojiSelected = (emojiObject: EmojiType) => {
    setContent((prev) => (prev + emojiObject.emoji).slice(0, MAX_CHARACTERS));
  };

  const handlePublish = async () => {
    if (!content.trim() && mediaItems.length === 0) {
      Alert.alert("Empty Post", "Please write some text or attach an image.");
      return;
    }

    setIsPosting(true);
    try {
      let mediaIds: string[] = [];

      if (mediaItems.length > 0) {
        setPostingStatus(`Uploading 1 of ${mediaItems.length}...`);
        let completed = 0;

        const uploadPromises = mediaItems.map(async (item) => {
          const mimeType = getMimeType(item.uri, item.mimeType);
          const filename = getFilename(item.uri, item.filename);

          // 1. Get exact file size directly from device filesystem
          const fileInfo = await FileSystem.getInfoAsync(item.uri);
          if (!fileInfo.exists) {
            throw new Error(`Media file not found: ${filename}`);
          }
          const exactSize = fileInfo.size;

          // 2. Request pre-signed upload URL with exact disk byte count
          const uploadUrlRes = await getMediaUploadUrl({
            filename,
            mime_type: mimeType,
            size: exactSize,
          }).unwrap();

          const mediaId = uploadUrlRes.data.id;
          const uploadUrl = uploadUrlRes.data.upload_url;

          // 3. Upload raw binary bytes directly from disk to storage
          const uploadResult = await FileSystem.uploadAsync(uploadUrl, item.uri, {
            httpMethod: "PUT",
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
            headers: {
              "Content-Type": mimeType,
            },
          });

          if (uploadResult.status < 200 || uploadResult.status >= 300) {
            throw new Error(`Storage upload failed (HTTP ${uploadResult.status})`);
          }

          // 4. Confirm upload (R2 ContentLength matches exactSize exactly)
          await confirmMediaUpload({ mediaId }).unwrap();

          completed++;
          setPostingStatus(
            `Uploading ${Math.min(completed + 1, mediaItems.length)} of ${mediaItems.length}...`
          );
          return mediaId;
        });

        mediaIds = await Promise.all(uploadPromises);
      }

      setPostingStatus("Publishing post...");
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
    initials: getInitials(),
  };
}
