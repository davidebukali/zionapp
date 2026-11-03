import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

import { ChatDateSeparatorProps } from "./types";

export const ChatDateSeparator = React.memo(function ChatDateSeparator({
  label,
}: ChatDateSeparatorProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
        {label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
});

