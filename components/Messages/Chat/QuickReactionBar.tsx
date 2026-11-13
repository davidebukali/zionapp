import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { QUICK_REACTION_EMOJIS } from "../../../features/messages/constants";
import { QuickReactionBarProps } from "./types";

export const QuickReactionBar = React.memo(function QuickReactionBar({
  onSelectEmoji,
  onPressMore,
}: QuickReactionBarProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.outlineVariant,
        },
      ]}
    >
      {QUICK_REACTION_EMOJIS.map((emoji) => (
        <TouchableOpacity
          key={emoji}
          accessibilityRole="button"
          accessibilityLabel={`React with ${emoji}`}
          onPress={() => onSelectEmoji(emoji)}
          style={styles.emojiButton}
        >
          <Text style={styles.emojiText}>{emoji}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="More reactions"
        onPress={onPressMore}
        style={styles.emojiButton}
      >
        <Ionicons
          name="add"
          size={22}
          color={theme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  emojiButton: {
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiText: {
    fontSize: 24,
  },
});

