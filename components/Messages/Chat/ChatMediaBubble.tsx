import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";

import { ChatMediaBubbleProps } from "./types";

export const ChatMediaBubble = React.memo(function ChatMediaBubble({
  mediaUrl,
  mediaUrls,
}: ChatMediaBubbleProps) {
  const theme = useTheme();
  const urls =
    mediaUrls && mediaUrls.length > 0
      ? mediaUrls
      : mediaUrl
      ? [mediaUrl]
      : [];

  if (urls.length === 0) return null;

  // Single Image
  if (urls.length === 1) {
    return (
      <View
        style={[
          styles.singleContainer,
          {
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: theme.colors.outlineVariant,
          },
        ]}
      >
        <Image
          source={{ uri: urls[0] }}
          style={styles.fullImage}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Multi Image Grid (2 to 4 items)
  return (
    <View
      style={[
        styles.gridContainer,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.outlineVariant,
        },
      ]}
    >
      {urls.slice(0, 4).map((url, index) => (
        <View
          key={`${url}-${index}`}
          style={[
            styles.gridTile,
            urls.length === 3 && index === 0 ? styles.gridTileWide : null,
          ]}
        >
          <Image
            source={{ uri: url }}
            style={styles.fullImage}
            resizeMode="cover"
          />
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  singleContainer: {
    width: 220,
    height: 260,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  gridContainer: {
    width: 230,
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
    padding: 2,
  },
  gridTile: {
    width: "49%",
    height: 110,
    borderRadius: 10,
    overflow: "hidden",
  },
  gridTileWide: {
    width: "100%",
    height: 120,
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
});


