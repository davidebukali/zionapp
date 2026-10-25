import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

interface PostToolbarProps {
  onPickMedia: () => void;
  onOpenEmoji: () => void;
  remainingChars: number;
  disabled: boolean;
}

export function PostToolbar({
  onPickMedia,
  onOpenEmoji,
  remainingChars,
  disabled,
}: PostToolbarProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      style={[
        styles.toolbar,
        {
          backgroundColor: theme.colors.background,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View style={styles.actionGroup}>
        <TouchableOpacity
          accessibilityLabel="Add media from gallery"
          style={styles.actionButton}
          onPress={onPickMedia}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons name="image-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityLabel="Mention"
          style={styles.actionButton}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons name="at-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityLabel="Add emoji"
          style={styles.actionButton}
          onPress={onOpenEmoji}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons name="happy-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.charCounter, { color: theme.colors.onSurfaceVariant }]}>
        {remainingChars}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  actionButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  charCounter: {
    fontSize: 14,
    fontWeight: "500",
  },
});
