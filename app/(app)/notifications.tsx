import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../../assets/styles/theme";

export default function NotificationsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        globalStyles.screen,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <StatusBar
        backgroundColor={theme.colors.surface}
        style={theme.dark ? "light" : "dark"}
      />

      <View
        style={[
          globalStyles.commentsHeader,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.outlineVariant,
            paddingTop: insets.top,
            height: insets.top + 64,
          },
        ]}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={[
            globalStyles.commentsBackButton,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>

        <Text
          style={[
            globalStyles.commentsHeaderTitle,
            { color: theme.colors.onSurface },
          ]}
        >
          Notifications
        </Text>
      </View>

      <View style={globalStyles.commentsCenteredState}>
        <Ionicons
          name="notifications-outline"
          size={56}
          color={theme.colors.onSurfaceVariant}
        />
        <Text
          style={[
            globalStyles.commentsStateText,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          No notifications yet
        </Text>
      </View>
    </View>
  );
}

