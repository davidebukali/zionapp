import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { SettingsToggleItemProps } from "./types";

export function SettingsToggleItem({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  disabled = false,
  showDivider = false,
  accessibilityLabel,
}: SettingsToggleItemProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, disabled && { opacity: 0.45 }]}>
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
                  color: theme.colors.onSurface,
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

        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{
            false: theme.dark ? "#333333" : "#D1D5DB",
            true: theme.colors.primary,
          }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={theme.dark ? "#333333" : "#D1D5DB"}
          accessibilityRole="switch"
          accessibilityLabel={accessibilityLabel || title}
          accessibilityState={{ checked: value, disabled }}
        />
      </View>

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
    paddingVertical: 12,
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

