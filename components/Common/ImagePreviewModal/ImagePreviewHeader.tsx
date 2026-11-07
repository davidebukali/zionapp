import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { ImagePreviewHeaderProps } from "./types";

export const ImagePreviewHeader = React.memo(function ImagePreviewHeader({
  currentIndex,
  totalCount,
  topInset,
  onClose,
  onDownload,
  isDownloading = false,
}: ImagePreviewHeaderProps) {
  return (
    <View style={[styles.headerBar, { top: Math.max(topInset, 20) }]}>
      {totalCount > 1 ? (
        <Text style={styles.counterText}>
          {`${currentIndex + 1} of ${totalCount}`}
        </Text>
      ) : (
        <View style={styles.counterPlaceholder} />
      )}

      <View style={styles.actionGroup}>
        {Boolean(onDownload) && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Download image"
            style={styles.actionButton}
            onPress={onDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="download-outline" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Close image preview"
          style={styles.actionButton}
          onPress={onClose}
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  headerBar: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  counterPlaceholder: {
    width: 40,
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
});

