import React, { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { ZION_POST_TAG_REGEX } from "../../../features/messages/utils";

export interface ChatReplySnippetProps {
  senderName: string;
  text?: string | null;
  mediaUrl?: string;
  isOutgoingBubble?: boolean;
  onCancel?: () => void;
}

export const ChatReplySnippet = React.memo(function ChatReplySnippet({
  senderName,
  text,
  mediaUrl,
  isOutgoingBubble = false,
  onCancel,
}: ChatReplySnippetProps) {
  const theme = useTheme();

  const isComposerBanner = Boolean(onCancel);
  const snippetText = useMemo(() => {
    if (!text) {
      return mediaUrl ? "📷 Photo" : "Message";
    }
    if (ZION_POST_TAG_REGEX.test(text)) {
      const companionText = text.replace(ZION_POST_TAG_REGEX, "").trim();
      return companionText.length > 0 ? companionText : "Shared post";
    }
    return text.trim() || (mediaUrl ? "📷 Photo" : "Message");
  }, [text, mediaUrl]);

  const containerBg = isComposerBanner
    ? theme.colors.surfaceVariant
    : isOutgoingBubble
    ? "rgba(0, 0, 0, 0.16)"
    : "rgba(255, 255, 255, 0.12)";

  const bodyTextColor = isComposerBanner
    ? theme.colors.onSurfaceVariant
    : isOutgoingBubble
    ? theme.colors.onPrimary
    : theme.colors.onSurface;

  return (
    <View
      style={[
        styles.container,
        isComposerBanner ? styles.composerBanner : styles.bubbleSnippet,
        { backgroundColor: containerBg },
      ]}
    >
      {/* Left accent bar */}
      <View
        style={[
          styles.accentBar,
          { backgroundColor: theme.colors.primary },
        ]}
      />

      {/* Text column */}
      <View
        style={[
          styles.textColumn,
          isComposerBanner
            ? styles.textColumnComposer
            : styles.textColumnBubble,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[styles.senderName, { color: theme.colors.primary }]}
        >
          {senderName}
        </Text>
        <Text
          numberOfLines={2}
          style={[
            styles.snippetBody,
            { color: bodyTextColor, opacity: isOutgoingBubble ? 0.9 : 0.8 },
          ]}
        >
          {snippetText}
        </Text>
      </View>

      {/* Optional image thumbnail */}
      {Boolean(mediaUrl) && (
        <Image
          source={{ uri: mediaUrl }}
          style={[
            styles.thumbnail,
            { borderColor: theme.colors.outlineVariant },
          ]}
          resizeMode="cover"
        />
      )}

      {/* Cancel button when used as composer banner */}
      {isComposerBanner && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Cancel reply"
          onPress={onCancel}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.cancelButton}
        >
          <Ionicons
            name="close-circle"
            size={20}
            color={theme.colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  composerBanner: {
    minWidth: 160,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingRight: 10,
    marginBottom: 4,
  },
  bubbleSnippet: {
    minWidth: 160,
    borderRadius: 8,
    marginBottom: 6,
    paddingRight: 6,
  },
  accentBar: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 2,
  },
  textColumn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  textColumnComposer: {
    flex: 1,
  },
  textColumnBubble: {
    flexShrink: 1,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  snippetBody: {
    fontSize: 13,
    lineHeight: 17,
  },
  thumbnail: {
    width: 38,
    height: 38,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 6,
  },
  cancelButton: {
    padding: 2,
    marginLeft: 4,
  },
  replyActionContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 48,
    paddingLeft: 12,
  },
  replyActionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

export const ChatSwipeReplyAction = React.memo(function ChatSwipeReplyAction() {
  const theme = useTheme();

  return (
    <View style={styles.replyActionContainer}>
      <View
        style={[
          styles.replyActionCircle,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <Ionicons
          name="arrow-undo"
          size={18}
          color={theme.colors.primary}
        />
      </View>
    </View>
  );
});

