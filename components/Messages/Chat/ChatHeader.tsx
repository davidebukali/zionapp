import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../../../assets/styles/theme";
import { ChatHeaderProps } from "./types";
import { MessageAvatar } from "../MessageAvatar";

export const ChatHeader = React.memo(function ChatHeader({
  participant,
  onPressBack,
  isMuted = false,
  onPressOptions,
}: ChatHeaderProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        globalStyles.commentsHeader,
        {
          minHeight: 56,
          paddingHorizontal: 12,
          borderBottomColor: theme.colors.outlineVariant,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPressBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={globalStyles.commentsBackButton}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color={theme.colors.onBackground}
        />
      </TouchableOpacity>

      <View style={styles.participantRow}>
        <MessageAvatar
          name={participant.name}
          initials={participant.initials}
          avatarUrl={participant.avatarUrl}
          avatarColor={participant.avatarColor}
          isOnline={participant.isOnline}
          size={38}
        />

        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text
              style={[styles.nameText, { color: theme.colors.onBackground }]}
              numberOfLines={1}
            >
              {participant.name}
            </Text>
            {isMuted && (
              <Ionicons
                name="volume-mute-outline"
                size={15}
                color={theme.colors.onSurfaceVariant}
                style={styles.mutedIcon}
              />
            )}
          </View>
          <Text
            style={[
              styles.presenceText,
              { color: participant.isOnline ? "#10B981" : theme.colors.onSurfaceVariant },
            ]}
          >
            {participant.isOnline ? "Active now" : "Offline"}
          </Text>
        </View>
      </View>

      {onPressOptions && (
        <TouchableOpacity
          onPress={onPressOptions}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Thread options"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={globalStyles.postIconButton}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={theme.colors.onBackground}
          />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoCol: {
    marginLeft: 10,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mutedIcon: {
    marginLeft: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "700",
  },
  presenceText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 1,
  },
});
