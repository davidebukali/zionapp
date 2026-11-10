import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { ProfileHeaderProps } from "./types";
import { getUserInitials } from "../../utils/user";

export function ProfileHeader({
  profile,
  isOwnProfile,
  isFollowing = false,
  isFollowLoading = false,
  onPressBack,
  onPressEditProfile,
  onPressMessage,
  onPressToggleFollow,
  onPressMoreMenu,
}: ProfileHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const moreButtonRef = React.useRef<View>(null);

  const handleOpenMoreMenu = () => {
    if (moreButtonRef.current) {
      moreButtonRef.current.measure((_x, _y, width, height, pageX, pageY) => {
        onPressMoreMenu?.({
          x: pageX,
          y: pageY,
          width,
          height,
        });
      });
    } else {
      onPressMoreMenu?.();
    }
  };

  const initials = getUserInitials(profile.displayName, profile.username);

  return (
    <View style={styles.container}>
      {/* Banner */}
      <View
        style={[
          styles.banner,
          {
            paddingTop: insets.top,
            backgroundColor: theme.colors.primaryContainer,
          },
        ]}
      >
        {profile.coverUrl ? (
          <Image
            source={{ uri: profile.coverUrl }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: theme.dark ? "#541212" : "#9B2222" },
            ]}
          />
        )}

        {/* Top bar over banner */}
        <View style={[styles.topBar, { marginTop: insets.top + 6 }]}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={[
              styles.roundButton,
              { backgroundColor: "rgba(0, 0, 0, 0.45)" },
            ]}
            onPress={onPressBack}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          {isOwnProfile && onPressEditProfile && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Edit Profile"
              style={[
                styles.editProfileButton,
                {
                  borderColor: "rgba(255, 255, 255, 0.8)",
                  backgroundColor: "rgba(0, 0, 0, 0.35)",
                },
              ]}
              onPress={onPressEditProfile}
              activeOpacity={0.8}
            >
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          )}

          {!isOwnProfile && onPressMoreMenu && (
            <View ref={moreButtonRef} collapsable={false}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="More options"
                style={[
                  styles.roundButton,
                  { backgroundColor: "rgba(0, 0, 0, 0.45)" },
                ]}
                onPress={handleOpenMoreMenu}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Avatar overlapping banner bottom */}
        <View
          style={[
            styles.avatarContainer,
            {
              borderColor: theme.colors.background,
              backgroundColor: theme.dark ? "#4A1717" : "#7A1C1C",
            },
          ]}
        >
          {profile.avatarUrl ? (
            <Image
              source={{ uri: profile.avatarUrl }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.avatarInitials}>{initials}</Text>
          )}
        </View>
      </View>

      {/* Row below banner for action buttons (Message / Follow) */}
      <View style={styles.belowBannerRow}>
        <View style={styles.avatarSpacing} />

        {!isOwnProfile && (
          <View style={styles.actionButtonsContainer}>
            {onPressMessage && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Message"
                style={[
                  styles.actionButton,
                  styles.messageButton,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
                onPress={onPressMessage}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Message
                </Text>
              </TouchableOpacity>
            )}

            {onPressToggleFollow && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={isFollowing ? "Following" : "Follow"}
                disabled={isFollowLoading}
                style={[
                  styles.actionButton,
                  isFollowing
                    ? [
                        styles.followingButton,
                        { borderColor: theme.colors.outline },
                      ]
                    : [
                        styles.followButton,
                        { backgroundColor: theme.colors.primary },
                      ],
                ]}
                onPress={onPressToggleFollow}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    isFollowing
                      ? { color: theme.colors.onSurface }
                      : { color: theme.colors.onPrimary },
                  ]}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  banner: {
    width: "100%",
    height: 150,
    position: "relative",
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  roundButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  editProfileButton: {
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  editProfileText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  avatarContainer: {
    position: "absolute",
    bottom: -44,
    left: 16,
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3.5,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    zIndex: 10,
    elevation: 6,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  belowBannerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 52,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  avatarSpacing: {
    width: 88,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionButton: {
    height: 38,
    paddingHorizontal: 20,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  messageButton: {
    minWidth: 96,
  },
  followButton: {
    minWidth: 90,
  },
  followingButton: {
    minWidth: 96,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});

