import React from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { MessagesSearchBarProps } from "./types";

export function MessagesSearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = "Search messages",
}: MessagesSearchBarProps) {
  const theme = useTheme();

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <Ionicons
          name="search"
          size={18}
          color={theme.colors.onSurfaceVariant}
          style={styles.searchIcon}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          style={[styles.input, { color: theme.colors.onSurface }]}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityRole="search"
          accessibilityLabel={placeholder}
        />

        {value.length > 0 && (
          <TouchableOpacity
            onPress={onClear || (() => onChangeText(""))}
            accessibilityRole="button"
            accessibilityLabel="Clear search text"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.clearButton}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  container: {
    height: 44,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 2,
    marginLeft: 6,
  },
});

