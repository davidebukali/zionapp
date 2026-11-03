import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";

import { OnlineContact } from "../../features/messages/types";
import { ActiveContactsTrayProps } from "./types";
import { MessageAvatar } from "./MessageAvatar";

export const ActiveContactsTray = React.memo(function ActiveContactsTray({
  contacts,
  onSelectContact,
}: ActiveContactsTrayProps) {
  const theme = useTheme();

  const renderItem = ({ item }: { item: OnlineContact }) => {
    // Show first word as short display name under avatar (e.g. "Maya", "Studio")
    const firstName = item.name.split(" ")[0];

    return (
      <TouchableOpacity
        onPress={() => onSelectContact(item)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}${item.isOnline ? ", online" : ""}`}
        accessibilityHint="Opens or starts a conversation"
        style={styles.itemContainer}
      >
        <MessageAvatar
          name={item.name}
          initials={item.initials}
          avatarUrl={item.avatarUrl}
          avatarColor={item.avatarColor}
          isOnline={item.isOnline}
          size={58}
        />

        <Text
          style={[styles.nameText, { color: theme.colors.onSurface }]}
          numberOfLines={1}
        >
          {firstName}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  itemContainer: {
    alignItems: "center",
    width: 62,
  },
  nameText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
    textAlign: "center",
  },
});
