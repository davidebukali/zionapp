import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { MessagesHeaderProps } from "./types";

export function MessagesHeader({ onPressCompose }: MessagesHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>
        Messages
      </Text>

      <TouchableOpacity
        onPress={onPressCompose}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="New message"
        accessibilityHint="Compose a new message"
        style={[
          styles.composeButton,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <Ionicons
          name="create-outline"
          size={20}
          color={theme.colors.onSurface}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  composeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

