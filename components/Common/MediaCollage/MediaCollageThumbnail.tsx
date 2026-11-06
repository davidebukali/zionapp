import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MediaCollageThumbnailProps } from "./types";

export const MediaCollageThumbnail = React.memo(
  function MediaCollageThumbnail({
    item,
    index,
    isOverlay = false,
    overlayCount = 0,
    onPress,
  }: MediaCollageThumbnailProps) {
    const uri = typeof item === "string" ? item : item.uri ?? item.url ?? "";

    return (
      <TouchableOpacity
        style={styles.thumbnailWrapper}
        activeOpacity={onPress ? 0.85 : 1}
        disabled={!onPress}
        onPress={onPress}
        accessibilityRole={onPress ? "button" : undefined}
        accessibilityLabel={`Media item ${index + 1}`}
      >
        <Image source={{ uri }} style={styles.thumbnailImage} resizeMode="cover" />
        {isOverlay && (
          <View style={styles.moreOverlay}>
            <Text style={styles.moreOverlayText}>{`+${overlayCount}`}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  thumbnailWrapper: {
    flex: 1,
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  moreOverlayText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
});

