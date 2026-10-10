import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { useTheme } from "react-native-paper";

type AuthFooterProps = {
  promptText?: string;
  actionText?: string;
  onActionPress?: () => void;
};

export function AuthFooter({
  promptText = "New here?",
  actionText = "Create an account",
  onActionPress,
}: AuthFooterProps) {
  const theme = useTheme();
  const isDark = useColorScheme() === "dark";

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.promptText,
          { color: isDark ? theme.colors.onSurfaceVariant : "#777777" },
        ]}
      >
        {promptText}{" "}
      </Text>
      <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
        <Text style={[styles.actionText, { color: theme.colors.primary }]}>
          {actionText}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingVertical: 10,
  },
  promptText: {
    fontSize: 15,
    fontWeight: "400",
  },
  actionText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
