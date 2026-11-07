import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";

import { ImagePreviewPaginationProps } from "./types";

export const ImagePreviewPagination = React.memo(
  function ImagePreviewPagination({
    currentIndex,
    totalCount,
    bottomInset,
    activeColor,
  }: ImagePreviewPaginationProps) {
    const theme = useTheme();
    const resolvedActiveColor = activeColor ?? theme.colors.primary;

    if (totalCount <= 1) return null;

    return (
      <View
        style={[
          styles.dotsContainer,
          { bottom: Math.max(bottomInset, 20) + 10 },
        ]}
      >
        {Array.from({ length: totalCount }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex
                ? [styles.activeDot, { backgroundColor: resolvedActiveColor }]
                : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  dotsContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    height: 7,
    borderRadius: 3.5,
  },
  activeDot: {
    width: 20,
  },
  inactiveDot: {
    width: 7,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
});

