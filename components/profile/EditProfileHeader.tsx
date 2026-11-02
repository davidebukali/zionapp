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

interface EditProfileHeaderProps {
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

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
        style={[
          styles.saveButton,
          { backgroundColor: theme.colors.primary },
          isSaving && styles.disabledButton,
        ]}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color={theme.colors.onPrimary} />
        ) : (
          <Text
            style={[styles.saveText, { color: theme.colors.onPrimary }]}
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
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 64,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveText: {
    fontSize: 14,
    fontWeight: "700",
  },
});

