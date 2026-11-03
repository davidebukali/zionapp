import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { MessagesEmptyStateProps } from "./types";

export function MessagesEmptyState({
  searchQuery,
  onResetSearch,
}: MessagesEmptyStateProps) {
  const theme = useTheme();
  const isSearch = Boolean(searchQuery && searchQuery.trim());

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <Ionicons
          name={isSearch ? "search-outline" : "chatbubbles-outline"}
          size={36}
          color={theme.colors.onSurfaceVariant}
        />
      </View>

      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        {isSearch ? "No messages found" : "No messages yet"}
      </Text>

      <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        {isSearch
          ? `We couldn't find any conversations matching "${searchQuery}".`
          : "When you connect with people, your messages will show up here."}
      </Text>

      {isSearch && onResetSearch && (
        <TouchableOpacity
          onPress={onResetSearch}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          style={[
            styles.resetButton,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text style={styles.resetButtonText}>Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
    paddingVertical: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  resetButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

