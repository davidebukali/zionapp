import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

import { ChatTextBubbleProps } from "./types";

export const ChatTextBubble = React.memo(function ChatTextBubble({
  text,
  isOutgoing,
  isDeleted = false,
  isEdited = false,
}: ChatTextBubbleProps) {
  const theme = useTheme();

  const bubbleBg = isOutgoing
    ? theme.colors.primary
    : theme.colors.surfaceVariant;

  const textColor = isOutgoing ? theme.colors.onPrimary : theme.colors.onSurface;

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
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontStyle: isDeleted ? "italic" : "normal",
            opacity: isDeleted ? 0.75 : 1,
          },
        ]}
      >
        {text}
        {isEdited && !isDeleted ? (
          <Text style={styles.editedTag}> (edited)</Text>
        ) : null}
      </Text>
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
  editedTag: {
    fontSize: 11,
    opacity: 0.7,
  },
});
