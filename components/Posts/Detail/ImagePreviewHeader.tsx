import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export interface ImagePreviewHeaderProps {
  currentIndex: number;
  totalCount: number;
  topInset: number;
  onClose: () => void;
}

export const ImagePreviewHeader = React.memo(function ImagePreviewHeader({
  currentIndex,
  totalCount,
  topInset,
  onClose,
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

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Close image preview"
        style={styles.closeButton}
        onPress={onClose}
      >
        <Ionicons name="close" size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
  closeButton: {
    padding: 8,
  },
});

