import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../../assets/styles/theme";

export default function ProfileScreen() {
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
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.outlineVariant,
            paddingTop: insets.top,
            height: insets.top + 60,
          },
        ]}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={[
            styles.backButton,
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
            styles.headerTitle,
            { color: theme.colors.onSurface },
          ]}
        >
          Profile
        </Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <View style={styles.content}>
        <Text
          style={[
            styles.placeholderText,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          User profile view
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  backButtonPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  placeholderText: {
    fontSize: 15,
  },
});

