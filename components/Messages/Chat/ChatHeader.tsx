import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { ChatHeaderProps } from "./types";
import { MessageAvatar } from "../MessageAvatar";

export const ChatHeader = React.memo(function ChatHeader({
  participant,
  onPressBack,
}: ChatHeaderProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { borderBottomColor: theme.colors.outlineVariant },
      ]}
    >
      <TouchableOpacity
        onPress={onPressBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.backButton}
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
          <Text
            style={[styles.nameText, { color: theme.colors.onBackground }]}
            numberOfLines={1}
          >
            {participant.name}
          </Text>
          <Text style={styles.presenceText}>
            {participant.isOnline ? "Active now" : "Offline"}
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 6,
    marginRight: 6,
  },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoCol: {
    marginLeft: 10,
    justifyContent: "center",
  },
  nameText: {
    fontSize: 16,
    fontWeight: "700",
  },
  presenceText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#10B981", // Active green
    marginTop: 1,
  },
});

