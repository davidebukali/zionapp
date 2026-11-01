import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Avatar, useTheme } from "react-native-paper";

import { getUserInitials } from "../../utils/user";
import { DiscoverAccountCardProps } from "./types";

export function DiscoverAccountCard({
  account,
  onToggleFollow,
  onPressProfile,
}: DiscoverAccountCardProps) {
  const theme = useTheme();

  const handlePressCard = () => {
    onPressProfile?.(account.id);
  };

  const handlePressFollow = () => {
    onToggleFollow(account.id);
  };

  const initials = account.initials || getUserInitials(account.name);
  const avatarBgColor = account.avatarColor || theme.colors.primaryContainer;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePressCard}
      disabled={!onPressProfile}
      accessibilityRole="button"
      accessibilityLabel={`Account ${account.name}`}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
        },
      ]}
    >
      <View style={styles.contentRow}>
        {/* Avatar Slot */}
        <View style={styles.avatarContainer}>
          {account.avatarUrl ? (
            <Avatar.Image size={50} source={{ uri: account.avatarUrl }} />
          ) : (
            <Avatar.Text
              size={50}
              label={initials}
              color="#FFFFFF"
              style={{ backgroundColor: avatarBgColor }}
              labelStyle={styles.avatarLabel}
            />
          )}
        </View>

        {/* Info Column */}
        <View style={styles.infoColumn}>
          <Text
            numberOfLines={1}
            style={[styles.nameText, { color: theme.colors.onSurface }]}
          >
            {account.name}
          </Text>

          <Text
            numberOfLines={1}
            style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}
          >
            {`@${account.username} · ${account.meta}`}
          </Text>

          {account.bio ? (
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={[styles.bioText, { color: theme.colors.onSurfaceVariant }]}
            >
              {account.bio}
            </Text>
          ) : null}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handlePressFollow}
          accessibilityRole="button"
          accessibilityLabel={
            account.isFollowing
              ? `Unfollow ${account.name}`
              : `Follow ${account.name}`
          }
          style={[
            styles.followButton,
            account.isFollowing
              ? [
                  styles.followingButton,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]
              : [
                  styles.activeFollowButton,
                  {
                    backgroundColor: theme.colors.primary,
                    shadowColor: theme.colors.primary,
                  },
                ],
          ]}
        >
          <Text
            style={[
              styles.followButtonText,
              account.isFollowing
                ? { color: theme.colors.onSurface }
                : styles.activeFollowButtonText,
            ]}
          >
            {account.isFollowing ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 12,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatarLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  infoColumn: {
    flex: 1,
    marginRight: 10,
    justifyContent: "center",
  },
  nameText: {
    fontSize: 16,
    fontWeight: "700",
  },
  metaText: {
    fontSize: 13,
    marginTop: 2,
  },
  bioText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  followButton: {
    minWidth: 84,
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  activeFollowButton: {
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  followingButton: {
    borderWidth: 0,
  },
  followButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  activeFollowButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export default DiscoverAccountCard;

