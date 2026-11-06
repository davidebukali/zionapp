import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Avatar, useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../../assets/styles/theme";
import { TaggableUserItemProps } from "./types";

export const TaggableUserItem = React.memo(function TaggableUserItem({
  user,
  onPress,
}: TaggableUserItemProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onPress(user)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Tag ${user.name} @${user.username}`}
      style={[
        globalStyles.row,
        styles.userRow,
        { borderBottomColor: theme.colors.outlineVariant },
      ]}
    >
      <View style={styles.userInfo}>
        {user.avatarUrl ? (
          <Avatar.Image size={44} source={{ uri: user.avatarUrl }} />
        ) : (
          <Avatar.Text
            size={44}
            label={user.initials}
            style={{ backgroundColor: theme.colors.primaryContainer }}
            labelStyle={{
              color: theme.colors.onPrimaryContainer,
              fontWeight: "700",
            }}
          />
        )}
        <View style={styles.textColumn}>
          <Text
            style={[styles.nameText, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {user.name}
          </Text>
          <Text
            style={[
              styles.usernameText,
              { color: theme.colors.onSurfaceVariant },
            ]}
            numberOfLines={1}
          >
            {`@${user.username}`}
          </Text>
        </View>
      </View>

      <Ionicons name="at" size={20} color={theme.colors.primary} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  userRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  textColumn: {
    marginLeft: 12,
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
  },
  usernameText: {
    fontSize: 13,
    marginTop: 2,
  },
});
