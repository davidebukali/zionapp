import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { AccountClassificationCardRowProps } from "./types";

export function AccountClassificationCardRow({
  accountType,
  category,
  onPressCard,
}: AccountClassificationCardRowProps) {
  const theme = useTheme();

  const isIndividual = accountType === "individual";
  const isOrganization = accountType === "organization";

  const personalSubtitle = isIndividual ? category?.trim() || "Not selected" : "Not selected";
  const organizationSubtitle = isOrganization ? category?.trim() || "Not selected" : "Not selected";

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
        ACCOUNT TYPE
      </Text>
      <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
        Choose your community identity
      </Text>

      <View style={styles.row}>
        {/* Personal Account Card */}
        <TouchableOpacity
          onPress={() => onPressCard("individual")}
          activeOpacity={0.8}
          accessibilityRole="radio"
          accessibilityState={{ selected: isIndividual }}
          accessibilityLabel="Personal Account"
          style={[
            styles.card,
            {
              backgroundColor: isIndividual
                ? theme.dark
                  ? "rgba(186, 26, 26, 0.12)"
                  : "rgba(186, 26, 26, 0.06)"
                : theme.colors.surfaceVariant,
              borderColor: isIndividual
                ? theme.colors.primary
                : theme.colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: isIndividual
                    ? theme.colors.primary
                    : "rgba(255, 255, 255, 0.1)",
                },
              ]}
            >
              <Ionicons
                name="person"
                size={18}
                color={isIndividual ? "#FFFFFF" : theme.colors.onSurfaceVariant}
              />
            </View>

            <View
              style={[
                styles.radioOuter,
                {
                  borderColor: isIndividual
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {isIndividual && (
                <View
                  style={[
                    styles.radioInner,
                    { backgroundColor: theme.colors.primary },
                  ]}
                />
              )}
            </View>
          </View>

          <Text
            style={[styles.cardTitle, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            Personal Account
          </Text>
          <Text
            style={[
              styles.cardSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
            numberOfLines={1}
          >
            {personalSubtitle}
          </Text>
        </TouchableOpacity>

        {/* Church / Ministry Card */}
        <TouchableOpacity
          onPress={() => onPressCard("organization")}
          activeOpacity={0.8}
          accessibilityRole="radio"
          accessibilityState={{ selected: isOrganization }}
          accessibilityLabel="Church or Ministry Account"
          style={[
            styles.card,
            {
              backgroundColor: isOrganization
                ? theme.dark
                  ? "rgba(186, 26, 26, 0.12)"
                  : "rgba(186, 26, 26, 0.06)"
                : theme.colors.surfaceVariant,
              borderColor: isOrganization
                ? theme.colors.primary
                : theme.colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: isOrganization
                    ? theme.colors.primary
                    : "rgba(255, 255, 255, 0.1)",
                },
              ]}
            >
              <MaterialCommunityIcons
                name="church"
                size={18}
                color={isOrganization ? "#FFFFFF" : theme.colors.onSurfaceVariant}
              />
            </View>

            <View
              style={[
                styles.radioOuter,
                {
                  borderColor: isOrganization
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {isOrganization && (
                <View
                  style={[
                    styles.radioInner,
                    { backgroundColor: theme.colors.primary },
                  ]}
                />
              )}
            </View>
          </View>

          <Text
            style={[styles.cardTitle, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            Church / Ministry
          </Text>
          <Text
            style={[
              styles.cardSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
            numberOfLines={1}
          >
            {organizationSubtitle}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  card: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    minHeight: 110,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
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
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
});

