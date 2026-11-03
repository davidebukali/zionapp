import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

import { ChatReadReceiptProps } from "./types";

export const ChatReadReceipt = React.memo(function ChatReadReceipt({
  text,
}: ChatReadReceiptProps) {
  const theme = useTheme();

  if (!text) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.receiptText, { color: theme.colors.onSurfaceVariant }]}>
        {text}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-end",
    marginTop: 4,
    marginRight: 6,
  },
  receiptText: {
    fontSize: 11,
    fontWeight: "400",
  },
});

