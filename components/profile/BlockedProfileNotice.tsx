import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

export interface BlockedProfileNoticeProps {
  username: string;
  isUnblocking?: boolean;
  onPressUnblock: () => void;
}

export function BlockedProfileNotice({
  username,
  isUnblocking = false,
  onPressUnblock,
}: BlockedProfileNoticeProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: theme.dark
              ? "rgba(222, 58, 58, 0.15)"
              : "rgba(222, 58, 58, 0.08)",
          },
        ]}
      >
        <Ionicons name="ban-outline" size={36} color={theme.colors.error} />
      </View>

      <Text style={[styles.title, { color: theme.colors.onBackground }]}>
        You have blocked @{username}
      </Text>

      <Text
        style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        You won't see their posts or notifications, and they cannot message you
        or view your profile.
      </Text>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Unblock @${username}`}
        style={[
          styles.unblockButton,
          {
            borderColor: theme.colors.outline,
            backgroundColor: theme.colors.surfaceVariant,
          },
        ]}
        disabled={isUnblocking}
        onPress={onPressUnblock}
        activeOpacity={0.75}
      >
        <Text
          style={[styles.unblockButtonText, { color: theme.colors.onSurface }]}
        >
          {isUnblocking ? "Unblocking..." : "Unblock"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
  },
  unblockButton: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
    borderWidth: 1,
  },
  unblockButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

