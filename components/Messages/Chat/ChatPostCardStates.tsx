import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

export interface ChatPostCardStateProps {
  width: number;
}

export const ChatPostCardLoading = React.memo(
  function ChatPostCardLoading({ width }: ChatPostCardStateProps) {
    const theme = useTheme();

    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          {
            width,
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outlineVariant,
          },
        ]}
      >
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }
);

export const ChatPostCardUnavailable = React.memo(
  function ChatPostCardUnavailable({ width }: ChatPostCardStateProps) {
    const theme = useTheme();

    return (
      <View
        style={[
          styles.container,
          styles.fallbackContainer,
          {
            width,
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outlineVariant,
          },
        ]}
      >
        <Text
          style={[styles.fallbackText, { color: theme.colors.onSurfaceVariant }]}
          numberOfLines={1}
        >
          This post is unavailable
        </Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  loadingContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackContainer: {
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    fontSize: 13,
    fontWeight: "500",
  },
});

