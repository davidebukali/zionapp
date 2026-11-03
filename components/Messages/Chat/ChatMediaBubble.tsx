import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";

import { ChatMediaBubbleProps } from "./types";

export const ChatMediaBubble = React.memo(function ChatMediaBubble({
  mediaUrl,
}: ChatMediaBubbleProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.outlineVariant,
        },
      ]}
    >
      <Image source={{ uri: mediaUrl }} style={styles.image} resizeMode="cover" />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 210,
    height: 250,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

