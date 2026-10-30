import { Image, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../assets/styles/theme";

type AppHeaderProps = {
  title: string;
  hasUnreadNotifications?: boolean;
  onPressNotifications?: () => void;
};

const appIcon = require("../assets/images/icon.png");

export function AppHeader({
  title,
  hasUnreadNotifications = true,
  onPressNotifications,
}: AppHeaderProps) {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const handlePressNotifications = () => {
    if (onPressNotifications) {
      onPressNotifications();
    } else {
      router.push("/notifications");
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.outlineVariant,
          paddingTop: insets.top,
          height: insets.top + 56,
        },
      ]}
    >
      <StatusBar
        backgroundColor={theme.colors.surface}
        style={colorScheme === "dark" ? "light" : "dark"}
      />

      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Image source={appIcon} style={styles.icon} />
          <Text
            numberOfLines={1}
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            {title}
          </Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          hitSlop={8}
          style={globalStyles.postIconButton}
          onPress={handlePressNotifications}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={theme.colors.onSurface}
          />
          {hasUnreadNotifications ? (
            <View
              style={[
                styles.unreadDot,
                { backgroundColor: theme.colors.primary },
              ]}
            />
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
  },
  unreadDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
