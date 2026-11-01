import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";

import { DiscoverFilterBarProps } from "./types";

export function DiscoverFilterBar({
  categories,
  selectedCategory,
  onSelectCategory,
  style,
  contentContainerStyle,
}: DiscoverFilterBarProps) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
      style={[styles.scrollView, style]}
      contentContainerStyle={[styles.container, contentContainerStyle]}
    >
      {categories.map((category) => {
        const isSelected = category === selectedCategory;
        return (
          <TouchableOpacity
            key={category}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${category} filter`}
            onPress={() => onSelectCategory(category)}
            activeOpacity={0.8}
            style={[
              styles.pill,
              isSelected
                ? [
                    styles.activePill,
                    {
                      backgroundColor: theme.colors.primary,
                      shadowColor: theme.colors.primary,
                    },
                  ]
                : {
                    backgroundColor: theme.colors.surfaceVariant,
                  },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                isSelected
                  ? styles.activePillText
                  : { color: theme.colors.onSurface },
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    marginHorizontal: -16,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  pill: {
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  activePill: {
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
  },
  activePillText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export default DiscoverFilterBar;

