import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "react-native-paper";

import { ProfileInputFieldProps } from "./types";

export function ProfileInputField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  autoCapitalize = "sentences",
  autoCorrect = true,
  keyboardType = "default",
}: ProfileInputFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.fieldGroup}>
      <Text
        style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        keyboardType={keyboardType}
        style={[
          styles.textInput,
          multiline && styles.textArea,
          {
            backgroundColor: theme.colors.surfaceVariant,
            color: theme.colors.onSurface,
            borderColor: theme.colors.outlineVariant,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: 2,
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: "top",
  },
});

