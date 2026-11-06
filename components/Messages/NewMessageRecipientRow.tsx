import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";

import { globalStyles } from "../../assets/styles/theme";
import { OnlineContact } from "../../features/messages/types";
import { MessageAvatar } from "./MessageAvatar";

export interface NewMessageRecipientRowProps {
  contact: OnlineContact;
  onPress: (contact: OnlineContact) => void;
}

export const NewMessageRecipientRow = React.memo(
  function NewMessageRecipientRow({
    contact,
    onPress,
  }: NewMessageRecipientRowProps) {
    const theme = useTheme();

    const handlePress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onPress(contact);
    }, [contact, onPress]);

    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Message ${contact.name}`}
        style={[
          globalStyles.row,
          styles.recipientRow,
          { borderBottomColor: theme.colors.outlineVariant },
        ]}
      >
        <View style={styles.recipientInfo}>
          <MessageAvatar
            name={contact.name}
            initials={contact.initials}
            avatarUrl={contact.avatarUrl}
            avatarColor={contact.avatarColor}
            isOnline={contact.isOnline}
            size={46}
          />
          <View style={styles.textColumn}>
            <Text
              style={[styles.nameText, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {contact.name}
            </Text>
            {Boolean(contact.username) && (
              <Text
                style={[
                  styles.usernameText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
                numberOfLines={1}
              >
                @{contact.username}
              </Text>
            )}
          </View>
        </View>

        <Ionicons
          name="chatbubble-ellipses-outline"
          size={20}
          color={theme.colors.primary}
        />
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  recipientRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  recipientInfo: {
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

