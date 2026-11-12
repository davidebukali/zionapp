import React from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import {
  ChatQuickReactionsModalProps,
  ChatReactionBadgeProps,
} from "./types";

export const QUICK_REACTION_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];
export const QUICK_CAPSULE_WIDTH = 270;
export const QUICK_CAPSULE_HEIGHT = 46;

export function calculateCapsulePosition(
  anchorPosition: { x: number; y: number; width: number; height: number } | null,
  isOutgoing: boolean,
  windowWidth: number
): { top: number; left: number } {
  if (!anchorPosition) {
    return { top: 100, left: 16 };
  }

  let capsuleTop = anchorPosition.y - QUICK_CAPSULE_HEIGHT - 8;
  if (capsuleTop < 60) {
    capsuleTop = anchorPosition.y + anchorPosition.height + 8;
  }

  let capsuleLeft: number;
  if (isOutgoing) {
    capsuleLeft = Math.max(
      16,
      anchorPosition.x + anchorPosition.width - QUICK_CAPSULE_WIDTH
    );
  } else {
    capsuleLeft = Math.min(
      anchorPosition.x,
      windowWidth - QUICK_CAPSULE_WIDTH - 16
    );
  }

  return { top: capsuleTop, left: capsuleLeft };
}

export const ChatQuickReactionsModal = React.memo(
  function ChatQuickReactionsModal({
    visible,
    isOutgoing,
    anchorPosition,
    onDismiss,
    onSelectEmoji,
    onPressMore,
  }: ChatQuickReactionsModalProps) {
    const theme = useTheme();
    const windowDimensions = Dimensions.get("window");
    const { top: capsuleTop, left: capsuleLeft } = calculateCapsulePosition(
      anchorPosition,
      isOutgoing,
      windowDimensions.width
    );

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onDismiss}
        statusBarTranslucent
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss reactions"
        />
        <View
          style={[
            styles.quickReactionsCapsule,
            {
              top: capsuleTop,
              left: capsuleLeft,
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
              style={styles.quickEmojiButton}
            >
              <Text style={styles.quickEmojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="More reactions"
            onPress={onPressMore}
            style={styles.quickEmojiButton}
          >
            <Ionicons
              name="add"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }
);

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
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  quickReactionsCapsule: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  quickEmojiButton: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  quickEmojiText: {
    fontSize: 22,
  },
});
