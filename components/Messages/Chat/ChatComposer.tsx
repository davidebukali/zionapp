import React from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { ChatComposerProps } from "./types";

export const ChatComposer = React.memo(function ChatComposer({
  text,
  onChangeText,
  onSend,
  onToggleEmoji,
  placeholder = "Message...",
}: ChatComposerProps) {
  const theme = useTheme();
  const canSend = Boolean(text.trim());

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.outlineVariant,
        },
      ]}
    >
      {/* Input Pill */}
      <View
        style={[
          styles.inputPill,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <TextInput
          value={text}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          style={[styles.input, { color: theme.colors.onSurface }]}
          multiline
          maxLength={1000}
          accessibilityLabel="Message input"
        />

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
      </View>

      {/* Send Button */}
      <TouchableOpacity
        onPress={onSend}
        disabled={!canSend}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Send message"
        style={[
          styles.sendButton,
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
          color={canSend ? "#FFFFFF" : theme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  inputPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    paddingHorizontal: 14,
    minHeight: 44,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
  },
  emojiButton: {
    marginLeft: 6,
    padding: 2,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});

