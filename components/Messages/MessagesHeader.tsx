import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../../assets/styles/theme";
import { MessagesHeaderProps } from "./types";

export function MessagesHeader({ onPressCompose }: MessagesHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          globalStyles.authPageTitle,
          { color: theme.colors.onBackground, marginBottom: 0 },
        ]}
      >
        Messages
      </Text>

      <TouchableOpacity
        onPress={onPressCompose}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="New message"
        accessibilityHint="Compose a new message"
        style={[
          globalStyles.postIconButton,
          {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 20,
          },
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
});
