import React from "react";
import { Image, StyleSheet, Text, View, useColorScheme } from "react-native";
import { useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles } from "../../assets/styles/theme";

const appIcon = require("../../assets/images/auth-icon.png");

type AuthHeaderProps = {
  title?: string;
  subtitle?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
};

export function AuthHeader({
  title = "Welcome back",
  subtitle = "Sign in to pick up where you left off.",
  iconName,
}: AuthHeaderProps) {
  const theme = useTheme();
  const isDark = useColorScheme() === "dark";

  return (
    <View style={styles.container}>
      {/* Contextual Icon Badge for recovery flows, or App Icon for Login/Register */}
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
        <Image
          source={appIcon}
          style={styles.appIcon}
          accessibilityRole="image"
          accessibilityLabel="Tsiyon app icon"
        />
      )}

      {/* Header Text */}
      <Text
        style={[
          globalStyles.authPageTitle,
          { color: isDark ? theme.colors.onBackground : "#111111" },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          globalStyles.authPageSubtitle,
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
  appIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    marginBottom: 28,
  },
});
