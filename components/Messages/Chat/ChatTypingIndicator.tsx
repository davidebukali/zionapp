import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

import { ChatTypingIndicatorProps } from "./types";
import { MessageAvatar } from "../MessageAvatar";

export const ChatTypingIndicator = React.memo(function ChatTypingIndicator({
  participant,
  visible = true,
}: ChatTypingIndicatorProps) {
  const theme = useTheme();

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <MessageAvatar
        name={participant.name}
        initials={participant.initials}
        avatarUrl={participant.avatarUrl}
        avatarColor={participant.avatarColor}
        isOnline={false}
        size={24}
      />

      <View
        style={[
          styles.bubble,
          {
            backgroundColor: theme.colors.surfaceVariant,
          },
        ]}
      >
        <Text
          style={[styles.dotsText, { color: theme.colors.onSurfaceVariant }]}
        >
          •••
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 6,
    gap: 8,
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderBottomLeftRadius: 4,
  },
  dotsText: {
    fontSize: 16,
    letterSpacing: 2,
    fontWeight: "700",
  },
});
