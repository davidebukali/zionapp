import React from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import EmojiPicker from "rn-emoji-keyboard";

import { globalStyles } from "../../../assets/styles/theme";
import { useChatThread } from "../../../hooks/useChatThread";
import {
  ChatHeader,
  ChatMessageList,
  ChatComposer,
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
      <ChatHeader participant={participant} onPressBack={handleBack} />

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
        />

        {/* Message Input Bar */}
        <ChatComposer
          text={inputText}
          onChangeText={setInputText}
          onSend={handleSendMessage}
          onToggleEmoji={handleToggleEmoji}
          disabled={!canSendMessages}
        />
      </KeyboardAvoidingView>

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
