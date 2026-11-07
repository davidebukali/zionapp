import React from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import EmojiPicker from "rn-emoji-keyboard";

import { globalStyles } from "../../../assets/styles/theme";
import { useChatThread } from "../../../hooks/useChatThread";
import { ImagePreviewModal } from "../../../components/Common";
import {
  ChatHeader,
  ChatMessageList,
  ChatComposer,
  ChatThreadOptionsSheet,
} from "../../../components/Messages/Chat";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const {
    participant,
    messages,
    inputText,
    setInputText,
    isTyping,
    isEmojiPickerOpen,
    setIsEmojiPickerOpen,
    handleToggleEmoji,
    handleEmojiSelected,
    handleSendMessage,
    handleBack,
    canSendMessages,
    isLoadingMore,
    hasMore,
    onLoadMore,
    isOptionsOpen,
    isMuted,
    isArchived,
    isBlocked,
    handleOpenOptions,
    handleCloseOptions,
    handleToggleMute,
    handleToggleArchive,
    handleClearHistory,
    handleReport,
    handleToggleBlock,
    selectedMedia,
    handlePickMedia,
    handleRemoveMedia,
    isUploadingMedia,
    uploadStatusText,
    previewMediaUrls,
    previewMediaIndex,
    handleOpenMediaPreview,
    handleCloseMediaPreview,
  } = useChatThread(id);

  return (
    <View
      style={[
        globalStyles.screen,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Recipient Header */}
      <ChatHeader
        participant={participant}
        onPressBack={handleBack}
        isMuted={isMuted}
        onPressOptions={handleOpenOptions}
      />

      {/* Keyboard Avoiding Container */}
      <KeyboardAvoidingView
        style={globalStyles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Message Stream */}
        <ChatMessageList
          messages={messages}
          participant={participant}
          isTyping={isTyping}
          onLoadMore={onLoadMore}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onPressMedia={handleOpenMediaPreview}
        />

        {/* Message Input Bar */}
        <ChatComposer
          text={inputText}
          onChangeText={setInputText}
          onSend={handleSendMessage}
          onToggleEmoji={handleToggleEmoji}
          disabled={!canSendMessages}
          selectedMedia={selectedMedia}
          onPickMedia={handlePickMedia}
          onRemoveMedia={handleRemoveMedia}
          isUploadingMedia={isUploadingMedia}
          uploadStatusText={uploadStatusText}
        />
      </KeyboardAvoidingView>

      {/* Thread & User Actions Bottom Sheet */}
      <ChatThreadOptionsSheet
        visible={isOptionsOpen}
        participant={participant}
        isMuted={isMuted}
        isArchived={isArchived}
        isBlocked={isBlocked}
        onClose={handleCloseOptions}
        onToggleMute={handleToggleMute}
        onToggleArchive={handleToggleArchive}
        onClearHistory={handleClearHistory}
        onReport={handleReport}
        onToggleBlock={handleToggleBlock}
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
      {/* Fullscreen Image Preview & Save Modal */}
      <ImagePreviewModal
        images={previewMediaUrls}
        initialIndex={previewMediaIndex ?? 0}
        visible={previewMediaIndex !== null}
        onClose={handleCloseMediaPreview}
        enableDownload
      />
    </View>
  );
}
