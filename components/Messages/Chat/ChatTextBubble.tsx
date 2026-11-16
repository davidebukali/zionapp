import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { ChatTextBubbleProps } from "./types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
export const CHAT_BUBBLE_MAX_WIDTH = Math.round(SCREEN_WIDTH * 0.76);

export const ChatTextBubble = React.memo(function ChatTextBubble({
  text,
  isOutgoing,
  isDeleted = false,
  isEdited = false,
  timestamp,
  status,
  header,
  children,
}: ChatTextBubbleProps) {
  const theme = useTheme();

  const bubbleBg = isOutgoing
    ? theme.colors.primary
    : theme.colors.surfaceVariant;

  const textColor = isOutgoing ? theme.colors.onPrimary : theme.colors.onSurface;
  const hasHeader = Boolean(header || children);

  return (
    <View
      style={[
        styles.bubble,
        hasHeader && styles.bubbleWithHeader,
        {
          backgroundColor: bubbleBg,
          borderBottomRightRadius: isOutgoing ? 4 : 18,
          borderBottomLeftRadius: isOutgoing ? 18 : 4,
        },
      ]}
    >
      {header}
      {children}
      {Boolean(text) && (
        <Text
          style={[
            styles.text,
            hasHeader && styles.textWithHeader,
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
      )}

      {Boolean(timestamp) && (
        <View style={styles.metaRow}>
          <Text
            style={[
              styles.metaTimestamp,
              {
                color: isOutgoing
                  ? "rgba(255, 255, 255, 0.75)"
                  : theme.colors.onSurfaceVariant,
              },
            ]}
          >
            {timestamp}
          </Text>
          {isOutgoing && status && !isDeleted && (
            <View
              style={styles.statusIconContainer}
              accessibilityLabel={`Status: ${status}`}
            >
              {status === "sending" && (
                <Ionicons
                  name="time-outline"
                  size={12}
                  color="rgba(255, 255, 255, 0.75)"
                />
              )}
              {status === "sent" && (
                <Ionicons
                  name="checkmark"
                  size={14}
                  color="rgba(255, 255, 255, 0.85)"
                />
              )}
              {status === "delivered" && (
                <Ionicons
                  name="checkmark-done"
                  size={14}
                  color="rgba(255, 255, 255, 0.85)"
                />
              )}
              {status === "read" && (
                <Ionicons
                  name="checkmark-done"
                  size={14}
                  color="#64D2FF"
                />
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  bubble: {
    maxWidth: CHAT_BUBBLE_MAX_WIDTH,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleWithHeader: {
    padding: 6,
    minWidth: 160,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
  textWithHeader: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 4,
  },
  editedTag: {
    fontSize: 11,
    opacity: 0.7,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 2,
    marginLeft: 12,
    gap: 4,
  },
  metaTimestamp: {
    fontSize: 10,
    lineHeight: 13,
  },
  statusIconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
