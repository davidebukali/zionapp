import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

import { ChatTextBubbleProps } from "./types";

export const ChatTextBubble = React.memo(function ChatTextBubble({
  text,
  isOutgoing,
}: ChatTextBubbleProps) {
  const theme = useTheme();

  const bubbleBg = isOutgoing
    ? theme.colors.primary
    : theme.dark
    ? "#262626"
    : theme.colors.surfaceVariant;

  const textColor = isOutgoing ? "#FFFFFF" : theme.colors.onSurface;

  return (
    <View
      style={[
        styles.bubble,
        {
          backgroundColor: bubbleBg,
          borderBottomRightRadius: isOutgoing ? 4 : 18,
          borderBottomLeftRadius: isOutgoing ? 18 : 4,
        },
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  bubble: {
    maxWidth: "76%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
});

