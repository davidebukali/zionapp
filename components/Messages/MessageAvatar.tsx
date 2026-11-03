import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

export interface MessageAvatarProps {
  name?: string;
  initials: string;
  avatarUrl?: string;
  avatarColor?: string;
  isOnline?: boolean;
  size?: number;
}

export const MessageAvatar = React.memo(function MessageAvatar({
  initials,
  avatarUrl,
  avatarColor,
  isOnline = false,
  size = 54,
}: MessageAvatarProps) {
  const theme = useTheme();

  const borderRadius = Math.round(size / 2);
  const fontSize = Math.round(size * 0.32);
  const badgeSize = Math.max(12, Math.round(size * 0.26));
  const badgeRadius = Math.round(badgeSize / 2);

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: size, height: size, borderRadius }}
        />
      ) : (
        <View
          style={[
            styles.fallbackCircle,
            {
              width: size,
              height: size,
              borderRadius,
              backgroundColor:
                avatarColor || theme.colors.primaryContainer,
            },
          ]}
        >
          <Text style={[styles.initialsText, { fontSize }]}>
            {initials}
          </Text>
        </View>
      )}

      {isOnline && (
        <View
          style={[
            styles.onlineBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeRadius,
              borderColor: theme.colors.background,
            },
          ]}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  fallbackCircle: {
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#10B981", // Online green badge
    borderWidth: 2.5,
  },
});

