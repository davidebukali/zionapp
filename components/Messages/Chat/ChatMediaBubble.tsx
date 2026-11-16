import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { ChatMediaBubbleProps } from "./types";

export const ChatMediaBubble = React.memo(function ChatMediaBubble({
  mediaUrl,
  mediaUrls,
  isOutgoing,
  timestamp,
  status,
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

  const renderStatusPill = () => {
    if (!timestamp) return null;
    return (
      <View style={styles.floatingMetaPill}>
        <Text style={styles.floatingMetaTimestamp}>{timestamp}</Text>
        {isOutgoing && status && (
          <View
            style={styles.statusIconContainer}
            accessibilityLabel={`Status: ${status}`}
          >
            {status === "sending" && (
              <Ionicons
                name="time-outline"
                size={12}
                color="rgba(255, 255, 255, 0.9)"
              />
            )}
            {status === "sent" && (
              <Ionicons
                name="checkmark"
                size={14}
                color="rgba(255, 255, 255, 0.9)"
              />
            )}
            {status === "delivered" && (
              <Ionicons
                name="checkmark-done"
                size={14}
                color="rgba(255, 255, 255, 0.95)"
              />
            )}
            {status === "read" && (
              <Ionicons
                name="checkmark-done"
                size={14}
                color="#64D2FF"
              />
            )}
          </View>
        )}
      </View>
    );
  };

  // Single Image
  if (urls.length === 1) {
    return (
      <View style={styles.outerContainer}>
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
        {renderStatusPill()}
      </View>
    );
  }

  // Multi Image Grid (2 to 4 items)
  return (
    <View style={styles.outerContainer}>
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
      {renderStatusPill()}
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    position: "relative",
  },
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
  floatingMetaPill: {
    position: "absolute",
    bottom: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  floatingMetaTimestamp: {
    color: "#FFFFFF",
    fontSize: 10,
    lineHeight: 13,
  },
  statusIconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});


