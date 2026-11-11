import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";

import { ChatReactionBadgeProps } from "./types";

export const ChatReactionBadge = React.memo(function ChatReactionBadge({
  reactions,
  rawReactions,
  onPressReaction,
}: ChatReactionBadgeProps) {
  const theme = useTheme();

  // Aggregate items with count and user_reacted status
  const reactionItems = React.useMemo(() => {
    if (rawReactions && rawReactions.length > 0) {
      return rawReactions.map((item) => ({
        emoji: item.emoji,
        count: item.count,
        userReacted: item.user_reacted,
      }));
    }

    if (reactions && reactions.length > 0) {
      const countsMap = new Map<string, number>();
      reactions.forEach((r) => {
        countsMap.set(r, (countsMap.get(r) || 0) + 1);
      });
      return Array.from(countsMap.entries()).map(([emoji, count]) => ({
        emoji,
        count,
        userReacted: false,
      }));
    }

    return [];
  }, [reactions, rawReactions]);

  if (reactionItems.length === 0) return null;

  return (
    <View style={styles.container}>
      {reactionItems.map((item) => {
        const label = item.count > 1 ? `${item.emoji} ${item.count}` : item.emoji;

        return (
          <TouchableOpacity
            key={item.emoji}
            accessibilityRole="button"
            accessibilityLabel={`Reaction ${item.emoji}${item.count > 1 ? `, count ${item.count}` : ""}`}
            onPress={() => onPressReaction?.(item.emoji)}
            disabled={!onPressReaction}
            style={[
              styles.badge,
              {
                backgroundColor: theme.colors.inverseSurface,
                borderColor: item.userReacted
                  ? theme.colors.primary
                  : theme.colors.background,
              },
            ]}
          >
            <Text
              style={[
                styles.emojiText,
                { color: theme.colors.inverseOnSurface },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    right: 4,
    flexDirection: "row",
    gap: 4,
    zIndex: 5,
    elevation: 5,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  emojiText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
