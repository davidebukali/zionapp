import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";

import { EditProfileHeaderProps } from "./types";

export function EditProfileHeader({
  isSaving,
  onCancel,
  onSave,
}: EditProfileHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + 8,
          borderBottomColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onCancel}
        disabled={isSaving}
        accessibilityRole="button"
        accessibilityLabel="Cancel"
        style={styles.textButton}
      >
        <Text
          style={[styles.cancelText, { color: theme.colors.onSurfaceVariant }]}
        >
          Cancel
        </Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        Edit Profile
      </Text>

      <TouchableOpacity
        onPress={onSave}
        disabled={isSaving}
        accessibilityRole="button"
        accessibilityLabel="Save profile"
        style={styles.textButton}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Text
            style={[styles.saveText, { color: theme.colors.primary }]}
          >
            Save
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  textButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "700",
  },
});

