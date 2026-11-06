import React from "react";
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../../../assets/styles/theme";

export type MediaCollageItem = string | { uri?: string; url?: string };

export interface MediaCollageProps {
  items: MediaCollageItem[];
  onEdit?: () => void;
  onRemoveAll?: () => void;
  onPressItem?: (index: number) => void;
  borderRadius?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

export function MediaCollage({
  items,
  onEdit,
  onRemoveAll,
  onPressItem,
  borderRadius = 18,
  containerStyle,
}: MediaCollageProps) {
  const theme = useTheme();

  if (!items || items.length === 0) return null;

  const getMediaUri = (item: MediaCollageItem): string => {
    if (typeof item === "string") return item;
    return item.uri ?? item.url ?? "";
  };

  const renderThumbnail = (
    item: MediaCollageItem,
    index: number,
    isOverlay = false,
    overlayCount = 0
  ) => {
    const uri = getMediaUri(item);
    const handlePress = onPressItem ? () => onPressItem(index) : onEdit;

    return (
      <TouchableOpacity
        key={`${uri}-${index}`}
        style={styles.thumbnailWrapper}
        activeOpacity={handlePress ? 0.85 : 1}
        disabled={!handlePress}
        onPress={handlePress}
        accessibilityRole={handlePress ? "button" : undefined}
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
  };

  const hasControls = Boolean(onEdit || onRemoveAll);

  return (
    <View
      style={[
        styles.collageContainer,
        hasControls ? { marginTop: 16 } : null,
        { borderRadius },
        containerStyle,
      ]}
    >
      {/* Floating Action Controls for Composer */}
      {hasControls && (
        <View style={styles.collageControls}>
          {onEdit && (
            <TouchableOpacity
              style={[
                globalStyles.postIconButton,
                styles.floatingButton,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
              onPress={onEdit}
              activeOpacity={0.8}
              accessibilityLabel="Edit attached media"
            >
              <Ionicons name="pencil" size={16} color={theme.colors.onSurface} />
            </TouchableOpacity>
          )}

          {onRemoveAll && (
            <TouchableOpacity
              style={[
                globalStyles.postIconButton,
                styles.floatingButton,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
              onPress={onRemoveAll}
              activeOpacity={0.8}
              accessibilityLabel="Remove all attached media"
            >
              <Ionicons name="close" size={18} color={theme.colors.onSurface} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={[styles.collageContent, { borderRadius }]}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  collageContainer: {
    position: "relative",
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
  floatingButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
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
