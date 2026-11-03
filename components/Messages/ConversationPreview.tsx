import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { LastMessage } from "../../features/messages/types";

export interface ConversationPreviewProps {
  lastMessage: LastMessage;
  unreadCount: number;
}

export const ConversationPreview = React.memo(
  function ConversationPreview({
    lastMessage,
    unreadCount,
  }: ConversationPreviewProps) {
    const theme = useTheme();

    switch (lastMessage.type) {
      case "outgoing":
        return (
          <Text
            style={[styles.previewText, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={1}
          >
            <Text style={styles.outgoingPrefix}>you: </Text>
            {lastMessage.text}
          </Text>
        );

      case "reaction":
        return (
          <Text
            style={[styles.previewText, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={1}
          >
            {`reacted ${lastMessage.reactionEmoji || "❤️"} to your message`}
          </Text>
        );

      case "photo":
        return (
          <View style={styles.photoPreviewRow}>
            <Ionicons
              name="camera-outline"
              size={15}
              color={theme.colors.onSurfaceVariant}
              style={styles.photoIcon}
            />
            <Text
              style={[
                styles.previewText,
                { color: theme.colors.onSurfaceVariant },
              ]}
              numberOfLines={1}
            >
              Photo
            </Text>
          </View>
        );

      default:
        return (
          <Text
            style={[
              styles.previewText,
              {
                color:
                  unreadCount > 0
                    ? theme.colors.onSurface
                    : theme.colors.onSurfaceVariant,
                fontWeight: unreadCount > 0 ? "600" : "400",
              },
            ]}
            numberOfLines={1}
          >
            {lastMessage.text}
          </Text>
        );
    }
  }
);

const styles = StyleSheet.create({
  previewText: {
    fontSize: 14,
    lineHeight: 19,
  },
  outgoingPrefix: {
    fontWeight: "500",
    opacity: 0.8,
  },
  photoPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  photoIcon: {
    marginRight: 4,
  },
});

