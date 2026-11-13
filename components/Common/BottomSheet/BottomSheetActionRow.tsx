import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../../../assets/styles/theme";
import { BottomSheetActionRowProps } from "./types";

export const BottomSheetActionRow = React.memo(
  function BottomSheetActionRow({
    label,
    onPress,
    icon,
    destructive = false,
    showChevron = false,
    showDivider = true,
    accessibilityLabel,
  }: BottomSheetActionRowProps) {
    const theme = useTheme();

    const activeColor = destructive
      ? theme.colors.error
      : theme.colors.onSurface;

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label}
        style={[
          globalStyles.row,
          styles.rowContainer,
          {
            borderBottomColor: showDivider
              ? theme.colors.outlineVariant
              : "transparent",
          },
        ]}
      >
        <View style={globalStyles.row}>
          {icon && (
            <Ionicons
              name={icon}
              size={22}
              color={activeColor}
              style={styles.iconSpacing}
            />
          )}
          <Text style={[styles.labelText, { color: activeColor }]}>
            {label}
          </Text>
        </View>

        {showChevron && (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.colors.onSurfaceVariant}
          />
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  rowContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: "space-between",
  },
  iconSpacing: {
    marginRight: 12,
  },
  labelText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

