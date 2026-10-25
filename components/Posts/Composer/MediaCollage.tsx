import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { MediaItem } from "../../../hooks/useCreatePostComposer";

interface MediaCollageProps {
  items: MediaItem[];
  onEdit: () => void;
  onRemoveAll: () => void;
}

export function MediaCollage({ items, onEdit, onRemoveAll }: MediaCollageProps) {
  const theme = useTheme();

  if (items.length === 0) return null;

  const renderThumbnail = (item: MediaItem, index: number, isOverlay = false, overlayCount = 0) => (
    <View style={styles.thumbnailWrapper} key={`${item.uri}-${index}`}>
      <Image source={{ uri: item.uri }} style={styles.thumbnailImage} resizeMode="cover" />
      {isOverlay && (
        <View style={styles.moreOverlay}>
          <Text style={styles.moreOverlayText}>+{overlayCount}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.collageContainer}>
      {/* Floating Action Buttons */}
      <View style={styles.collageControls}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={onEdit}
          activeOpacity={0.8}
          accessibilityLabel="Edit attached media"
        >
          <Ionicons name="pencil" size={16} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={onRemoveAll}
          activeOpacity={0.8}
          accessibilityLabel="Remove all attached media"
        >
          <Ionicons name="close" size={18} color={theme.colors.onSurface} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity activeOpacity={0.9} onPress={onEdit} style={styles.collagePressable}>
        {items.length === 1 && (
          <View style={styles.singleContainer}>
            {renderThumbnail(items[0], 0)}
          </View>
        )}

        {items.length === 2 && (
          <View style={styles.twoContainer}>
            {renderThumbnail(items[0], 0)}
            {renderThumbnail(items[1], 1)}
          </View>
        )}

        {items.length === 3 && (
          <View style={styles.threeContainer}>
            <View style={styles.heroColumn}>{renderThumbnail(items[0], 0)}</View>
            <View style={styles.stackedColumn}>
              {renderThumbnail(items[1], 1)}
              {renderThumbnail(items[2], 2)}
            </View>
          </View>
        )}

        {items.length >= 4 && (
          <View style={styles.multiContainer}>
            <View style={styles.heroColumn}>{renderThumbnail(items[0], 0)}</View>
            <View style={styles.stackedColumn}>
              {renderThumbnail(items[1], 1)}
              {renderThumbnail(items[2], 2, items.length > 3, items.length - 3)}
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  collageContainer: {
    marginTop: 16,
    position: "relative",
    borderRadius: 18,
    overflow: "hidden",
  },
  collageControls: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    flexDirection: "row",
    gap: 8,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  collagePressable: {
    borderRadius: 18,
    overflow: "hidden",
  },
  singleContainer: {
    width: "100%",
    height: 240,
    borderRadius: 18,
    overflow: "hidden",
  },
  twoContainer: {
    width: "100%",
    height: 200,
    flexDirection: "row",
    gap: 6,
    borderRadius: 18,
    overflow: "hidden",
  },
  threeContainer: {
    width: "100%",
    height: 230,
    flexDirection: "row",
    gap: 6,
    borderRadius: 18,
    overflow: "hidden",
  },
  multiContainer: {
    width: "100%",
    height: 240,
    flexDirection: "row",
    gap: 6,
    borderRadius: 18,
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
