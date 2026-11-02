import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";

import { ProfileTabsProps, ProfileTabType } from "./types";

const TABS: Array<{ key: ProfileTabType; label: string }> = [
  { key: "posts", label: "Posts" },
  { key: "likes", label: "Likes" },
  { key: "reposts", label: "Reposts" },
  { key: "bookmarks", label: "Bookmarks" },
];

export function ProfileTabs({ activeTab, onSelectTab }: ProfileTabsProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderBottomColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${tab.label} tab`}
            onPress={() => onSelectTab(tab.key)}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive
                    ? theme.colors.onBackground
                    : theme.colors.onSurfaceVariant,
                  fontWeight: isActive ? "800" : "600",
                },
              ]}
            >
              {tab.label}
            </Text>

            {isActive && (
              <View
                style={[
                  styles.activeIndicator,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: "100%",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    position: "relative",
  },
  tabLabel: {
    fontSize: 15,
    letterSpacing: 0.1,
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 8,
    right: 8,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});

