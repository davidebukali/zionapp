import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

import { ChatReactionBadgeProps } from "./types";

export const ChatReactionBadge = React.memo(function ChatReactionBadge({
  reactions,
}: ChatReactionBadgeProps) {
  const theme = useTheme();

  if (!reactions || reactions.length === 0) return null;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.dark ? "#262626" : "#1A1A1A",
          borderColor: theme.colors.background,
        },
      ]}
    >
      <Text style={styles.emojiText}>{reactions.join(" ")}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    bottom: -8,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  emojiText: {
    fontSize: 12,
  },
});

