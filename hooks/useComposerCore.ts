import { useState, useMemo, useCallback, useRef } from "react";
import {
  Alert,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from "react-native";
import { useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { EmojiType } from "rn-emoji-keyboard";

import { RootState } from "../store/store";
import { MAX_CHARACTERS, MAX_MEDIA } from "../constants";
import { MediaItem } from "../utils/mediaUploader";
import { getUserInitials, getUserAvatarUrl } from "../utils/user";
import { TaggableUser } from "../features/users/types";
import {
  replaceMentionAtCursor,
  shouldTriggerMentionSheet,
  syncTaggedUserIds,
} from "../features/users/utils";

export function useComposerCore() {
  const [content, setContent] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // Mention sheet and tagging state
  const [isMentionSheetVisible, setIsMentionSheetVisible] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [hadTypedAtSymbol, setHadTypedAtSymbol] = useState(false);
  const taggedUsersMap = useRef<Map<string, string>>(new Map());
  const [taggedUserIds, setTaggedUserIds] = useState<string[]>([]);

  // Authenticated user initials & avatar
  const user = useSelector((state: RootState) => state.auth.user);
  const initials = useMemo(
    () => getUserInitials(user?.name, user?.email),
    [user?.name, user?.email]
  );
  const avatarUrl = useMemo(() => getUserAvatarUrl(user), [user]);

  // Selection change tracking for cursor position
  const handleSelectionChange = useCallback(
    (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      setCursorPosition(event.nativeEvent.selection.start);
    },
    []
  );

  // Content change handler detecting '@' trigger and syncing active mentions
  const handleContentChange = useCallback(
    (newText: string) => {
      const textCapped = newText.slice(0, MAX_CHARACTERS);
      const isAddingChar = textCapped.length > content.length;
      setContent(textCapped);

      const activeIds = syncTaggedUserIds(textCapped, taggedUsersMap.current);
      setTaggedUserIds(activeIds);

      if (isAddingChar) {
        const textBeforeCursor = textCapped.slice(0, cursorPosition + 1);
        if (shouldTriggerMentionSheet(textBeforeCursor)) {
          setHadTypedAtSymbol(true);
          setIsMentionSheetVisible(true);
          return;
        }
      }
    },
    [content.length, cursorPosition]
  );

  const handleOpenMentions = useCallback(() => {
    setHadTypedAtSymbol(false);
    setIsMentionSheetVisible(true);
  }, []);

  const handleCloseMentions = useCallback(() => {
    setIsMentionSheetVisible(false);
  }, []);

  const handleSelectTaggableUser = useCallback(
    (selectedUser: TaggableUser) => {
      if (
        taggedUserIds.length >= 20 &&
        !taggedUserIds.includes(selectedUser.id)
      ) {
        Alert.alert(
          "Limit Reached",
          "You can tag up to 20 people in a single post."
        );
        return;
      }

      taggedUsersMap.current.set(selectedUser.username, selectedUser.id);

      const { newText, newCursorPosition } = replaceMentionAtCursor(
        content,
        cursorPosition,
        selectedUser.username,
        hadTypedAtSymbol
      );

      setContent(newText.slice(0, MAX_CHARACTERS));
      setCursorPosition(newCursorPosition);

      const updatedIds = syncTaggedUserIds(newText, taggedUsersMap.current);
      setTaggedUserIds(updatedIds);

      setIsMentionSheetVisible(false);
    },
    [content, cursorPosition, hadTypedAtSymbol, taggedUserIds]
  );

  // Media picking
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

  const remainingChars = MAX_CHARACTERS - content.length;
  const hasContent = content.trim().length > 0 || mediaItems.length > 0;

  return {
    content,
    setContent,
    handleContentChange,
    cursorPosition,
    handleSelectionChange,
    mediaItems,
    setMediaItems,
    isReviewModalVisible,
    setIsReviewModalVisible,
    reviewIndex,
    setReviewIndex,
    openReviewModal,
    isEmojiPickerOpen,
    setIsEmojiPickerOpen,
    isMentionSheetVisible,
    handleOpenMentions,
    handleCloseMentions,
    handleSelectTaggableUser,
    taggedUserIds,
    pickMedia,
    removeAllMedia,
    deleteReviewItem,
    handleEmojiSelected,
    initials,
    avatarUrl,
    remainingChars,
    hasContent,
  };
}

