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
  const thread = useChatThread(id);

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
        participant={thread.participant}
        onPressBack={thread.handleBack}
        isMuted={thread.isMuted}
        onPressOptions={thread.handleOpenOptions}
      />

      {/* Keyboard Avoiding Container */}
      <KeyboardAvoidingView
        style={globalStyles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Message Stream */}
        <ChatMessageList
          messages={thread.messages}
          participant={thread.participant}
          isTyping={thread.isTyping}
          onLoadMore={thread.onLoadMore}
          isLoadingMore={thread.isLoadingMore}
          hasMore={thread.hasMore}
          onPressMedia={thread.handleOpenMediaPreview}
          onReply={thread.handleReplyToMessage}
          onReact={thread.handleToggleReaction}
          onOpenReactionPicker={thread.handleOpenReactionPicker}
        />

        {/* Message Input Bar */}
        <ChatComposer
          text={thread.inputText}
          onChangeText={thread.setInputText}
          onSend={thread.handleSendMessage}
          onToggleEmoji={thread.handleToggleEmoji}
          disabled={!thread.canSendMessages}
          selectedMedia={thread.selectedMedia}
          onPickMedia={thread.handlePickMedia}
          onRemoveMedia={thread.handleRemoveMedia}
          isUploadingMedia={thread.isUploadingMedia}
          uploadStatusText={thread.uploadStatusText}
          replyingTo={thread.replyingTo}
          participantName={thread.participant.name}
          onCancelReply={thread.handleCancelReply}
        />
      </KeyboardAvoidingView>

      {/* Thread & User Actions Bottom Sheet */}
      <ChatThreadOptionsSheet
        visible={thread.isOptionsOpen}
        participant={thread.participant}
        isMuted={thread.isMuted}
        isArchived={thread.isArchived}
        isBlocked={thread.isBlocked}
        onClose={thread.handleCloseOptions}
        onToggleMute={thread.handleToggleMute}
        onToggleArchive={thread.handleToggleArchive}
        onClearHistory={thread.handleClearHistory}
        onReport={thread.handleReport}
        onToggleBlock={thread.handleToggleBlock}
      />

      {/* Emoji Keyboard Picker */}
      <EmojiPicker
        open={thread.isEmojiPickerOpen}
        onClose={() => thread.setIsEmojiPickerOpen(false)}
        onEmojiSelected={thread.handleEmojiSelected}
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
        images={thread.previewMediaUrls}
        initialIndex={thread.previewMediaIndex ?? 0}
        visible={thread.previewMediaIndex !== null}
        onClose={thread.handleCloseMediaPreview}
        enableDownload
      />
    </View>
  );
}
