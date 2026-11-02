import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

import { SettingsSectionProps } from "./types";

export function SettingsSection({
  title,
  children,
  style,
}: SettingsSectionProps) {
  const theme = useTheme();

  return (
    <View style={[styles.wrapper, style]}>
      {title ? (
        <Text
          style={[
            styles.title,
            {
              color: theme.dark ? "#888888" : theme.colors.onSurfaceVariant,
            },
          ]}
        >
          {title.toUpperCase()}
        </Text>
      ) : null}

      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.dark ? "#161616" : theme.colors.surface,
            borderColor: theme.dark ? "#262626" : theme.colors.outlineVariant,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginTop: 24,
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginBottom: 10,
    marginLeft: 4,
  },
  container: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
});

