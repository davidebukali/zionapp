import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Avatar, useTheme } from "react-native-paper";

import { globalStyles } from "../../../assets/styles/theme";
import { formatRelativeTime } from "../../../utils/date";
import { getUserInitials } from "../../../utils/user";

export interface ChatPostCardAuthorRowProps {
  author: string;
  avatarUrl?: string;
  createdAt?: string | Date;
}

export const ChatPostCardAuthorRow = React.memo(
  function ChatPostCardAuthorRow({
    author,
    avatarUrl,
    createdAt,
  }: ChatPostCardAuthorRowProps) {
    const theme = useTheme();
    const authorInitials = getUserInitials(author);
    const rawRelative = createdAt ? formatRelativeTime(createdAt) : "";
    const relativeTime = rawRelative
      ? `(${rawRelative.replace(/\s+ago$/, "")})`
      : "";

    return (
      <View style={styles.authorRow}>
        {/* Author Avatar (Far Left) */}
        {avatarUrl ? (
          <Avatar.Image size={24} source={{ uri: avatarUrl }} />
        ) : (
          <Avatar.Text
            size={24}
            label={authorInitials}
            color={theme.colors.onPrimaryContainer}
            style={{ backgroundColor: theme.colors.primaryContainer }}
            labelStyle={styles.avatarLabel}
          />
        )}

        {/* Author Name (Aligned Left Directly Beside Avatar) */}
        <Text
          style={[
            globalStyles.postAuthorText,
            styles.authorName,
            { color: theme.colors.onSurface },
          ]}
          numberOfLines={1}
        >
          {author}
        </Text>

        {/* Relative Timestamp e.g. (1d) Beside Author Name */}
        {Boolean(relativeTime) && (
          <Text
            style={[
              globalStyles.postTimestampText,
              styles.timeText,
              { color: theme.colors.onSurfaceVariant },
            ]}
            numberOfLines={1}
          >
            {relativeTime}
          </Text>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 6,
  },
  avatarLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  authorName: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "left",
    marginLeft: 0,
    flexShrink: 1,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 0,
    marginTop: 0,
  },
});

