import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { ClassificationOptionCardProps } from "./types";

export function ClassificationOptionCard({
  title,
  description,
  iconName,
  isSelected,
  onSelect,
  categories,
  selectedCategory,
  onSelectCategory,
  subCategoryLabel,
  hasVerifiedBadge = false,
}: ClassificationOptionCardProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onSelect}
      style={[
        styles.optionCard,
        {
          backgroundColor: isSelected
            ? theme.dark
              ? "rgba(186, 26, 26, 0.12)"
              : "rgba(186, 26, 26, 0.05)"
            : theme.colors.surfaceVariant,
          borderColor: isSelected
            ? theme.colors.primary
            : theme.colors.outlineVariant,
        },
      ]}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.cardHeaderLeft}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isSelected
                  ? theme.colors.primary
                  : "rgba(255, 255, 255, 0.1)",
              },
            ]}
          >
            {iconName === "person" ? (
              <Ionicons
                name="person"
                size={18}
                color={isSelected ? "#FFFFFF" : theme.colors.onSurfaceVariant}
              />
            ) : (
              <MaterialCommunityIcons
                name="church"
                size={18}
                color={isSelected ? "#FFFFFF" : theme.colors.onSurfaceVariant}
              />
            )}
          </View>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            {title}
          </Text>
        </View>

        <View style={styles.cardHeaderRight}>
          {isSelected && (
            <View style={styles.selectedPill}>
              <Text style={styles.selectedPillText}>SELECTED</Text>
            </View>
          )}
          <View
            style={[
              styles.radioOuter,
              {
                borderColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant,
              },
            ]}
          >
            {isSelected && (
              <View
                style={[
                  styles.radioInner,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
            )}
          </View>
        </View>
      </View>

      <Text
        style={[
          styles.cardDescription,
          { color: theme.colors.onSurfaceVariant },
        ]}
      >
        {description}
      </Text>

      {hasVerifiedBadge && (
        <View style={styles.verifiedBadgeBanner}>
          <Ionicons
            name="shield-checkmark"
            size={15}
            color="#EAB308"
            style={styles.verifiedBadgeIcon}
          />
          <Text style={styles.verifiedBadgeText}>
            Verified entity badge granted after leadership confirmation
          </Text>
        </View>
      )}

      {isSelected && (
        <View style={styles.subCategorySection}>
          <Text
            style={[
              styles.subCategoryLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {subCategoryLabel}
          </Text>
          <View style={styles.chipsWrap}>
            {categories.map((cat) => {
              const isChipSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => onSelectCategory(cat)}
                  activeOpacity={0.8}
                  style={[
                    styles.chip,
                    isChipSelected
                      ? {
                          backgroundColor: theme.colors.primary,
                          borderColor: theme.colors.primary,
                        }
                      : {
                          backgroundColor: theme.dark
                            ? "rgba(255, 255, 255, 0.08)"
                            : "rgba(0, 0, 0, 0.05)",
                          borderColor: theme.colors.outlineVariant,
                        },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isChipSelected
                          ? "#FFFFFF"
                          : theme.colors.onSurface,
                      },
                    ]}
                  >
                    {isChipSelected ? `✓ ${cat}` : cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  optionCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  selectedPill: {
    backgroundColor: "rgba(186, 26, 26, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  selectedPillText: {
    color: "#FF8A8A",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  verifiedBadgeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.3)",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  verifiedBadgeIcon: {
    marginRight: 6,
  },
  verifiedBadgeText: {
    color: "#EAB308",
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  subCategorySection: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  subCategoryLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

