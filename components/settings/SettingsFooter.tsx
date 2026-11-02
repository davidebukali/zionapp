import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
import * as Application from "expo-application";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";

import { SettingsFooterProps } from "./types";

export function SettingsFooter({
  version: propVersion,
  buildNumber: propBuildNumber,
  appName: propAppName,
  onCopySuccess,
  style,
}: SettingsFooterProps) {
  const theme = useTheme();

  const appName =
    propAppName ||
    Application.applicationName ||
    Constants.expoConfig?.name ||
    "Tsiyon";

  const version =
    propVersion ||
    Application.nativeApplicationVersion ||
    Constants.expoConfig?.version ||
    "2.4.1";

  const buildNumber =
    propBuildNumber ||
    Application.nativeBuildVersion ||
    Constants.expoConfig?.ios?.buildNumber ||
    (Constants.expoConfig?.android?.versionCode
      ? String(Constants.expoConfig.android.versionCode)
      : "2840");

  const buildString = `${appName} · v${version} (build ${buildNumber})`;

  const handlePress = async () => {
    try {
      await Clipboard.setStringAsync(buildString);
      onCopySuccess?.(buildString);
    } catch {
      // Fallback if clipboard fails
      onCopySuccess?.(buildString);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[styles.container, style]}
      accessibilityRole="button"
      accessibilityLabel={`App version: ${buildString}. Tap to copy.`}
      accessibilityHint="Copies app version and build info to clipboard"
    >
      <Text
        style={[
          styles.text,
          {
            color: theme.dark ? "#777777" : theme.colors.onSurfaceVariant,
          },
        ]}
      >
        {buildString}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
});

