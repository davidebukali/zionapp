import React from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles } from "../../assets/styles/theme";

type AuthHeaderProps = {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
};

export function AuthHeader({
  title = "Welcome back",
  subtitle = "Sign in to pick up where you left off.",
  badgeText = "Project preview",
  iconName,
}: AuthHeaderProps) {
  const theme = useTheme();
  const isDark = useColorScheme() === "dark";

  return (
    <View style={styles.container}>
      {/* Icon Badge or Brand Chip */}
      {iconName ? (
        <View
          style={[
            globalStyles.authIconBadge,
            { backgroundColor: isDark ? "#2A1616" : "#FFEBEA" },
          ]}
        >
          <Ionicons name={iconName} size={30} color={theme.colors.primary} />
        </View>
      ) : (
        <View style={styles.badgeWrapper}>
          <View style={[styles.redCircle, { backgroundColor: theme.colors.primary }]} />
          <View style={styles.chipTag}>
            <View style={styles.chipDot} />
            <Text style={styles.chipText}>{badgeText}</Text>
          </View>
        </View>
      )}

      {/* Header Text */}
      <Text
        style={[
          iconName ? globalStyles.authPageTitle : styles.title,
          { color: isDark ? theme.colors.onBackground : "#111111" },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          iconName ? globalStyles.authPageSubtitle : styles.subtitle,
          { color: isDark ? theme.colors.onSurfaceVariant : "#666666" },
        ]}
      >
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 36,
    alignItems: "flex-start",
  },
  badgeWrapper: {
    position: "relative",
    width: 220,
    height: 84,
    marginBottom: 24,
    justifyContent: "center",
  },
  redCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    position: "absolute",
    left: 0,
    top: 4,
  },
  chipTag: {
    position: "absolute",
    left: 20,
    top: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2B2B2E",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  chipDot: {
    width: 14,
    height: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 2.5,
    marginRight: 8,
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 22,
  },
});
