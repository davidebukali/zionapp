import React from "react";
import { StyleSheet, View } from "react-native";

import { MediaCollageGridProps } from "./types";
import { MediaCollageThumbnail } from "./MediaCollageThumbnail";

export const MediaCollageGrid = React.memo(function MediaCollageGrid({
  items,
  borderRadius,
  onPressItem,
  onEdit,
}: MediaCollageGridProps) {
  const getPressHandler = (index: number) => {
    if (onPressItem) return () => onPressItem(index);
    if (onEdit) return onEdit;
    return undefined;
  };

  return (
    <View style={[styles.collageContent, { borderRadius }]}>
      {items.length === 1 && (
        <View style={styles.singleContainer}>
          <MediaCollageThumbnail
            item={items[0]}
            index={0}
            onPress={getPressHandler(0)}
          />
        </View>
      )}

      {items.length === 2 && (
        <View style={styles.twoContainer}>
          <MediaCollageThumbnail
            item={items[0]}
            index={0}
            onPress={getPressHandler(0)}
          />
          <MediaCollageThumbnail
            item={items[1]}
            index={1}
            onPress={getPressHandler(1)}
          />
        </View>
      )}

      {items.length === 3 && (
        <View style={styles.threeContainer}>
          <View style={styles.heroColumn}>
            <MediaCollageThumbnail
              item={items[0]}
              index={0}
              onPress={getPressHandler(0)}
            />
          </View>
          <View style={styles.stackedColumn}>
            <MediaCollageThumbnail
              item={items[1]}
              index={1}
              onPress={getPressHandler(1)}
            />
            <MediaCollageThumbnail
              item={items[2]}
              index={2}
              onPress={getPressHandler(2)}
            />
          </View>
        </View>
      )}

      {items.length >= 4 && (
        <View style={styles.multiContainer}>
          <View style={styles.heroColumn}>
            <MediaCollageThumbnail
              item={items[0]}
              index={0}
              onPress={getPressHandler(0)}
            />
          </View>
          <View style={styles.stackedColumn}>
            <MediaCollageThumbnail
              item={items[1]}
              index={1}
              onPress={getPressHandler(1)}
            />
            <MediaCollageThumbnail
              item={items[2]}
              index={2}
              isOverlay={items.length > 3}
              overlayCount={items.length - 3}
              onPress={getPressHandler(2)}
            />
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  collageContent: {
    overflow: "hidden",
  },
  singleContainer: {
    width: "100%",
    height: 240,
    overflow: "hidden",
  },
  twoContainer: {
    width: "100%",
    height: 200,
    flexDirection: "row",
    gap: 6,
    overflow: "hidden",
  },
  threeContainer: {
    width: "100%",
    height: 230,
    flexDirection: "row",
    gap: 6,
    overflow: "hidden",
  },
  multiContainer: {
    width: "100%",
    height: 240,
    flexDirection: "row",
    gap: 6,
    overflow: "hidden",
  },
  heroColumn: {
    flex: 1.3,
    height: "100%",
  },
  stackedColumn: {
    flex: 1,
    height: "100%",
    gap: 6,
  },
});

