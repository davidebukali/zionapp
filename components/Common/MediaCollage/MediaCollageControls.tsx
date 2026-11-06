import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../../../assets/styles/theme";
import { MediaCollageControlsProps } from "./types";

export const MediaCollageControls = React.memo(
  function MediaCollageControls({
    onEdit,
    onRemoveAll,
  }: MediaCollageControlsProps) {
    const theme = useTheme();

    if (!onEdit && !onRemoveAll) return null;

    return (
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
    );
  }
);

const styles = StyleSheet.create({
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
});

