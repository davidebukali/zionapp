import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";

import { ChatMediaBubbleProps } from "./types";

export const ChatMediaBubble = React.memo(function ChatMediaBubble({
  mediaUrl,
  mediaUrls,
  onPressMedia,
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
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPressMedia?.(urls, 0)}
        disabled={!onPressMedia}
        accessibilityRole="button"
        accessibilityLabel="View photo"
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
      </TouchableOpacity>
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
        <TouchableOpacity
          key={`${url}-${index}`}
          activeOpacity={0.9}
          onPress={() => onPressMedia?.(urls, index)}
          disabled={!onPressMedia}
          accessibilityRole="button"
          accessibilityLabel={`View photo ${index + 1}`}
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
        </TouchableOpacity>
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


