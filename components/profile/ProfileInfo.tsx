import React, { useCallback } from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format, isValid, parseISO } from "date-fns";

import { ProfileInfoProps } from "./types";

export function ProfileInfo({ profile }: ProfileInfoProps) {
  const theme = useTheme();

  const handleOpenWebsite = useCallback(() => {
    if (!profile.website) return;
    const url = profile.website.startsWith("http")
      ? profile.website
      : `https://${profile.website}`;
    Linking.openURL(url).catch(() => {});
  }, [profile.website]);

  // Format joined date: e.g. "Joined October 2026"
  const formattedJoinedDate = React.useMemo(() => {
    if (!profile.joinedAt) return null;
    const parsed = parseISO(profile.joinedAt);
    if (!isValid(parsed)) return null;
    return `Joined ${format(parsed, "MMMM yyyy")}`;
  }, [profile.joinedAt]);

  return (
    <View style={styles.container}>
      {/* Display Name & Username */}
      <View style={styles.namesBlock}>
        <Text
          style={[styles.displayName, { color: theme.colors.onBackground }]}
          numberOfLines={1}
        >
          {profile.displayName}
        </Text>
        <Text
          style={[styles.username, { color: theme.colors.onSurfaceVariant }]}
          numberOfLines={1}
        >
          {`@${profile.username}`}
        </Text>
      </View>

      {/* Bio */}
      {Boolean(profile.bio) && (
        <Text style={[styles.bio, { color: theme.colors.onBackground }]}>
          {profile.bio}
        </Text>
      )}

      {/* Metadata Section (Location & Joined Date on Row 1, Website on Row 2) */}
      {(Boolean(profile.location) ||
        Boolean(formattedJoinedDate) ||
        Boolean(profile.website)) && (
        <View style={styles.metadataSection}>
          {(Boolean(profile.location) || Boolean(formattedJoinedDate)) && (
            <View style={styles.metadataRow}>
              {Boolean(profile.location) && (
                <View style={styles.metaItem}>
                  <Ionicons
                    name="location-outline"
                    size={15}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      styles.metaText,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                    numberOfLines={1}
                  >
                    {profile.location}
                  </Text>
                </View>
              )}

              {Boolean(formattedJoinedDate) && (
                <View style={styles.metaItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={15}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      styles.metaText,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {formattedJoinedDate}
                  </Text>
                </View>
              )}
            </View>
          )}

          {Boolean(profile.website) && (
            <View style={styles.websiteRow}>
              <TouchableOpacity
                onPress={handleOpenWebsite}
                activeOpacity={0.7}
                style={styles.metaItem}
                accessibilityRole="link"
              >
                <Ionicons
                  name="link-outline"
                  size={15}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.metaText,
                    styles.linkText,
                    { color: theme.colors.primary },
                  ]}
                  numberOfLines={1}
                >
                  {profile.website}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Follower Stats Row (Following & Followers only) */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text
            style={[styles.statNumber, { color: theme.colors.onBackground }]}
          >
            {profile.followingCount}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Following
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text
            style={[styles.statNumber, { color: theme.colors.onBackground }]}
          >
            {profile.followersCount}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Followers
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  namesBlock: {
    marginBottom: 8,
  },
  displayName: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  username: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 2,
  },
  bio: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "400",
    marginBottom: 12,
  },
  metadataSection: {
    gap: 8,
    marginBottom: 14,
  },
  metadataRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 14,
  },
  websiteRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 14,
    fontWeight: "400",
  },
  linkText: {
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginTop: 2,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "400",
  },
});
