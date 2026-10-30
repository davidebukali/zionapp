import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Avatar } from "react-native-paper";
import EmojiPicker from "rn-emoji-keyboard";

import { globalStyles } from "../../assets/styles/theme";
import { useCreatePostComposer } from "../../hooks/useCreatePostComposer";
import { PostHeader } from "../../components/Posts/Composer/PostHeader";
import { MediaCollage } from "../../components/Posts/Composer/MediaCollage";
import { MediaReviewModal } from "../../components/Posts/Composer/MediaReviewModal";
import { PostToolbar } from "../../components/Posts/Composer/PostToolbar";

export default function NewPostScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const {
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
    avatarUrl,
  } = useCreatePostComposer();

  const handleOpenEmoji = () => {
    Keyboard.dismiss();
    setIsEmojiPickerOpen(true);
  };

  return (
    <View
      style={[
        globalStyles.screen,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <PostHeader
        onClose={handleClose}
        onPublish={handlePublish}
        isPosting={isPosting}
        postingStatus={postingStatus}
        disabled={isPostDisabled}
      />

      <KeyboardAvoidingView
        style={globalStyles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={globalStyles.screen}
          contentContainerStyle={globalStyles.feedContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Author Avatar Row */}
          <View style={globalStyles.row}>
            {avatarUrl ? (
              <Avatar.Image
                size={48}
                source={{ uri: avatarUrl }}
              />
            ) : (
              <Avatar.Text
                size={48}
                label={initials}
                style={{ backgroundColor: theme.colors.primaryContainer }}
                labelStyle={{ color: theme.colors.onPrimaryContainer, fontWeight: "700" }}
              />
            )}
          </View>

          {/* Multiline Composer */}
          <TextInput
            multiline
            placeholder="What is happening?"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={content}
            onChangeText={setContent}
            maxLength={3000}
            editable={!isPosting}
            style={[
              globalStyles.postBodyText,
              {
                color: theme.colors.onBackground,
                minHeight: 100,
                textAlignVertical: "top",
                marginTop: 12,
              },
            ]}
          />

          {/* Media Collage */}
          <MediaCollage
            items={mediaItems}
            onEdit={() => openReviewModal(0)}
            onRemoveAll={removeAllMedia}
          />
        </ScrollView>

        {/* Bottom Toolbar */}
        <PostToolbar
          onPickMedia={pickMedia}
          onOpenEmoji={handleOpenEmoji}
          remainingChars={remainingChars}
          disabled={isPosting}
        />
      </KeyboardAvoidingView>

      {/* Full-Screen Review Modal */}
      <MediaReviewModal
        visible={isReviewModalVisible}
        items={mediaItems}
        currentIndex={reviewIndex}
        onIndexChange={setReviewIndex}
        onClose={() => setIsReviewModalVisible(false)}
        onDeleteItem={deleteReviewItem}
      />

      {/* Emoji Keyboard Picker */}
      <EmojiPicker
        open={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        onEmojiSelected={handleEmojiSelected}
        theme={{
          backdrop: "rgba(0, 0, 0, 0.6)",
          container: theme.colors.surface,
          header: theme.colors.onSurface,
          knob: theme.colors.outline,
          category: {
            icon: theme.colors.onSurfaceVariant,
            iconActive: theme.colors.primary,
            container: "transparent",
            containerActive: theme.colors.primaryContainer,
          },
          search: {
            background: theme.colors.surfaceVariant,
            text: theme.colors.onSurface,
            placeholder: theme.colors.onSurfaceVariant,
            icon: theme.colors.onSurfaceVariant,
          },
        }}
      />
    </View>
  );
}
