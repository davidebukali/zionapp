import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { SettingsNavItemProps } from "./types";

export function SettingsNavItem({
  icon,
  title,
  subtitle,
  onPress,
  isDestructive = false,
  showDivider = false,
  accessibilityLabel,
}: SettingsNavItemProps) {
  const theme = useTheme();

  const titleColor = isDestructive
    ? theme.colors.primary
    : theme.colors.onSurface;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={styles.container}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
      >
        <View style={styles.leftGroup}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: theme.dark
                  ? "rgba(222, 58, 58, 0.12)"
                  : "rgba(222, 58, 58, 0.08)",
              },
            ]}
          >
            <Ionicons
              name={icon}
              size={18}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.textColumn}>
            <Text
              style={[
                styles.title,
                {
                  color: titleColor,
                },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: theme.colors.onSurfaceVariant,
                  },
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.dark ? "#666666" : theme.colors.outline}
        />
      </TouchableOpacity>

      {showDivider ? (
        <View
          style={[
            styles.divider,
            {
              backgroundColor: theme.dark ? "#222222" : theme.colors.outlineVariant,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  textColumn: {
    marginLeft: 14,
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 66,
  },
});

