import React from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../../../assets/styles/theme";
import { MAX_MESSAGE_LENGTH } from "../../../constants";
import { ChatComposerProps } from "./types";

export const ChatComposer = React.memo(function ChatComposer({
  text,
  onChangeText,
  onSend,
  onToggleEmoji,
  placeholder = "Message...",
  disabled = false,
}: ChatComposerProps) {
  const theme = useTheme();
  const canSend = !disabled && Boolean(text.trim());

  return (
    <View
      style={[
        globalStyles.commentComposerContainer,
        {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.outlineVariant,
        },
      ]}
    >
      {/* Input Pill */}
      <View
        style={[
          globalStyles.commentComposerInputShell,
          {
            backgroundColor: theme.colors.surfaceVariant,
            marginLeft: 0,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <TextInput
          value={text}
          onChangeText={onChangeText}
          editable={!disabled}
          placeholder={disabled ? "You cannot message this user." : placeholder}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          style={[
            globalStyles.commentComposerInput,
            { color: theme.colors.onSurface },
          ]}
          multiline
          maxLength={MAX_MESSAGE_LENGTH}
          accessibilityLabel="Message input"
        />

        {!disabled && (
          <TouchableOpacity
            onPress={onToggleEmoji}
            accessibilityRole="button"
            accessibilityLabel="Add emoji"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.emojiButton}
          >
            <Ionicons
              name="happy-outline"
              size={22}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Send Button */}
      <TouchableOpacity
        onPress={onSend}
        disabled={!canSend}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Send message"
        style={[
          globalStyles.commentSendButton,
          {
            backgroundColor: canSend
              ? theme.colors.primary
              : theme.colors.surfaceVariant,
            opacity: canSend ? 1 : 0.5,
          },
        ]}
      >
        <Ionicons
          name="send"
          size={17}
          color={canSend ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  emojiButton: {
    padding: 6,
  },
});
