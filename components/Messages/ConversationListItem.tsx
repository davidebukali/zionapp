import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import * as Haptics from "expo-haptics";

import { ConversationListItemProps } from "./types";
import { formatMessageTimestamp } from "../../features/messages/utils";
import { MessageAvatar } from "./MessageAvatar";
import { ConversationPreview } from "./ConversationPreview";

export const ConversationListItem = React.memo(
  function ConversationListItem({
    conversation,
    onPress,
  }: ConversationListItemProps) {
    const theme = useTheme();
    const { participant, lastMessage, unreadCount } = conversation;

    const handlePress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onPress(conversation);
    }, [conversation, onPress]);

    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.65}
        accessibilityRole="button"
        accessibilityLabel={`Chat with ${participant.name}`}
        style={[
          styles.container,
          { borderBottomColor: theme.colors.outlineVariant },
        ]}
      >
        {/* Reusable Avatar with Status */}
        <View style={styles.avatarWrapper}>
          <MessageAvatar
            name={participant.name}
            initials={participant.initials}
            avatarUrl={participant.avatarUrl}
            avatarColor={participant.avatarColor}
            isOnline={participant.isOnline}
            size={54}
          />
        </View>

        {/* Participant Name & Message Preview */}
        <View style={styles.contentCol}>
          <Text
            style={[styles.nameText, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {participant.name}
          </Text>
          <ConversationPreview
            lastMessage={lastMessage}
            unreadCount={unreadCount}
          />
        </View>

        {/* Timestamp & Unread Counter Badge */}
        <View style={styles.metaCol}>
          <Text
            style={[styles.timeText, { color: theme.colors.onSurfaceVariant }]}
          >
            {formatMessageTimestamp(lastMessage.timestamp)}
          </Text>

          {unreadCount > 0 ? (
            <View
              style={[
                styles.unreadBadge,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={styles.unreadBadgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyBadgeSpacer} />
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatarWrapper: {
    marginRight: 14,
  },
  contentCol: {
    flex: 1,
    justifyContent: "center",
  },
  nameText: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },
  metaCol: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 42,
    marginLeft: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "400",
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  emptyBadgeSpacer: {
    height: 20,
  },
});
