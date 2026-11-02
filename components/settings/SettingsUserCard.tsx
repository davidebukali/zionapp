import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Avatar, useTheme } from "react-native-paper";

import { getUserInitials } from "../../utils/user";
import { SettingsUserCardProps } from "./types";

export function SettingsUserCard({
  user,
  onPressManage,
  style,
}: SettingsUserCardProps) {
  const theme = useTheme();

  const name = user?.name || "User";
  const initials = user?.initials || getUserInitials(user?.name, user?.email, "AR");

  const subtitle = React.useMemo(() => {
    const parts: string[] = [];
    if (user?.username) {
      parts.push(`@${user.username.replace(/^@/, "")}`);
    }
    if (user?.email) {
      parts.push(user.email);
    }
    return parts.length > 0 ? parts.join(" · ") : "@user";
  }, [user?.username, user?.email]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.dark ? "#7E1919" : theme.colors.primary,
        },
        style,
      ]}
      accessibilityRole="summary"
    >
      <View style={styles.leftSection}>
        {user?.avatarUrl ? (
          <Avatar.Image
            size={48}
            source={{ uri: user.avatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <Avatar.Text
            size={48}
            label={initials}
            labelStyle={styles.avatarLabel}
            style={styles.avatar}
          />
        )}

        <View style={styles.textContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.subtitleText} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPressManage}
        style={styles.manageButton}
        accessibilityRole="button"
        accessibilityLabel="Manage profile"
      >
        <Text style={styles.manageButtonText}>Manage</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    backgroundColor: "#2563EB",
  },
  avatarLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 18,
  },
  textContainer: {
    marginLeft: 14,
    flex: 1,
    justifyContent: "center",
  },
  nameText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  subtitleText: {
    color: "rgba(255, 255, 255, 0.72)",
    fontSize: 13,
    fontWeight: "400",
  },
  manageButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  manageButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

