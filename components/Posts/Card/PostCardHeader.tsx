import React, { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Avatar, Card, useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles, postTokens } from "../../../assets/styles/theme";
import { formatRelativeTime } from "../../../utils/date";
import { AnchorPosition, PostCardMenu } from "./PostCardMenu";

interface PostCardHeaderProps {
  title: string;
  createdAt: string | Date;
  avatarUrl?: string;
  isOwnPost?: boolean;
  isFollowingAuthor?: boolean;
  activityType?: "post" | "repost" | "like" | "comment";
  activityActor?: string;
  onPressThreeDots?: () => void;
  onPressEdit?: () => void;
  onPressDelete?: () => void;
  onPressFollowToggle?: () => void;
  onPressReport?: () => void;
  onPressShareDM?: () => void;
  onPressShareSystem?: () => void;
}

const getInitials = (name?: string): string => {
  if (!name) return "AR";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export function PostCardHeader({
  title,
  createdAt,
  avatarUrl,
  isOwnPost = false,
  isFollowingAuthor = false,
  activityType,
  activityActor,
  onPressThreeDots,
  onPressEdit,
  onPressDelete,
  onPressFollowToggle,
  onPressReport,
  onPressShareDM,
  onPressShareSystem,
}: PostCardHeaderProps) {
  const theme = useTheme();
  const threeDotRef = useRef<View>(null);
  const [anchorPosition, setAnchorPosition] = useState<AnchorPosition | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleOpenMenu = () => {
    onPressThreeDots?.();
    if (threeDotRef.current) {
      threeDotRef.current.measureInWindow((x, y, width, height) => {
        setAnchorPosition({ x, y, width, height });
        setMenuVisible(true);
      });
    } else {
      setMenuVisible(true);
    }
  };

  const hasActivity = Boolean(
    activityType && activityType !== "post" && activityActor
  );

  return (
    <>
      {hasActivity ? (
        <View style={styles.activityRow}>
          <Ionicons
            name={
              activityType === "repost"
                ? "repeat"
                : activityType === "like"
                ? "heart"
                : "chatbubble-ellipses"
            }
            size={14}
            color={
              activityType === "repost" || activityType === "like"
                ? theme.colors.primary
                : theme.colors.onSurfaceVariant
            }
            style={styles.activityIcon}
          />
          <Text
            numberOfLines={1}
            style={[styles.activityText, { color: theme.colors.onSurfaceVariant }]}
          >
            {`${activityActor} ${
              activityType === "repost"
                ? "reposted"
                : activityType === "like"
                ? "liked"
                : "commented"
            }`}
          </Text>
        </View>
      ) : null}

      <Card.Title
        title={title}
        subtitle={formatRelativeTime(createdAt)}
        titleNumberOfLines={1}
        subtitleNumberOfLines={1}
        style={globalStyles.postTitle}
        titleStyle={[
          globalStyles.postAuthorText,
          { color: theme.colors.onSurface },
        ]}
        subtitleStyle={[
          globalStyles.postTimestampText,
          { color: theme.colors.onSurfaceVariant },
        ]}
        left={(props) =>
          avatarUrl ? (
            <Avatar.Image
              {...props}
              size={54}
              source={{ uri: avatarUrl }}
              style={globalStyles.postAvatar}
            />
          ) : (
            <Avatar.Text
              {...props}
              size={54}
              label={getInitials(title)}
              color={theme.colors.onPrimaryContainer}
              style={[
                globalStyles.postAvatar,
                {
                  paddingRight: 0,
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
              labelStyle={{ fontSize: 18, fontWeight: "700" }}
            />
          )
        }
        right={() => (
          <TouchableOpacity
            ref={threeDotRef}
            accessibilityRole="button"
            accessibilityLabel="More post options"
            hitSlop={12}
            style={globalStyles.postIconButton}
            onPress={handleOpenMenu}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={26}
              color={postTokens.actionColor}
            />
          </TouchableOpacity>
        )}
        rightStyle={globalStyles.postTitleRight}
      />

      <PostCardMenu
        visible={menuVisible}
        anchorPosition={anchorPosition}
        isOwnPost={isOwnPost}
        isFollowingAuthor={isFollowingAuthor}
        onClose={() => setMenuVisible(false)}
        onPressEdit={onPressEdit}
        onPressDelete={onPressDelete}
        onPressFollowToggle={onPressFollowToggle}
        onPressReport={onPressReport}
        onPressShareDM={onPressShareDM}
        onPressShareSystem={onPressShareSystem}
      />
    </>
  );
}

const styles = StyleSheet.create({
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 26,
    paddingTop: 12,
    paddingBottom: 2,
  },
  activityIcon: {
    marginRight: 6,
  },
  activityText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
