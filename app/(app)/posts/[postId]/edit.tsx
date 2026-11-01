import React from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Avatar } from "react-native-paper";
import EmojiPicker from "rn-emoji-keyboard";

import { globalStyles } from "../../../../assets/styles/theme";
import { useEditPostComposer } from "../../../../hooks/useEditPostComposer";
import { PostHeader } from "../../../../components/Posts/Composer/PostHeader";
import { MediaCollage } from "../../../../components/Posts/Composer/MediaCollage";
import { MediaReviewModal } from "../../../../components/Posts/Composer/MediaReviewModal";
import { PostToolbar } from "../../../../components/Posts/Composer/PostToolbar";

export default function EditPostScreen() {
  const params = useLocalSearchParams<{ postId: string }>();
  const postId = Array.isArray(params.postId) ? params.postId[0] : params.postId || "";
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
    isSaving,
    savingStatus,
    handleSave,
    handleClose,
    remainingChars,
    isSaveDisabled,
    initials,
    avatarUrl,
    isLoadingPost,
  } = useEditPostComposer(postId);

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
        title="Edit post"
        actionLabel="Save"
        onClose={handleClose}
        onPublish={handleSave}
        isPosting={isSaving}
        postingStatus={savingStatus}
        disabled={isSaveDisabled}
      />

      {isLoadingPost && !content && mediaItems.length === 0 ? (
        <View style={[globalStyles.screen, { alignItems: "center", justifyContent: "center" }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
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
                <Avatar.Image size={48} source={{ uri: avatarUrl }} />
              ) : (
                <Avatar.Text
                  size={48}
                  label={initials}
                  style={{ backgroundColor: theme.colors.primaryContainer }}
                  labelStyle={{
                    color: theme.colors.onPrimaryContainer,
                    fontWeight: "700",
                  }}
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
              editable={!isSaving}
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
            disabled={isSaving}
          />
        </KeyboardAvoidingView>
      )}

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
