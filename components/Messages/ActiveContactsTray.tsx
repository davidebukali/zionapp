import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { OnlineContact } from "../../features/messages/types";
import { ActiveContactsTrayProps } from "./types";
import { MessageAvatar } from "./MessageAvatar";

export const ActiveContactsTray = React.memo(function ActiveContactsTray({
  contacts,
  onSelectContact,
  onPressCompose,
}: ActiveContactsTrayProps) {
  const theme = useTheme();

  const renderNewButton = () => {
    if (!onPressCompose) return null;

    return (
      <TouchableOpacity
        onPress={onPressCompose}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="New message"
        accessibilityHint="Compose a new message"
        style={styles.itemContainer}
      >
        <View
          style={[
            styles.newButtonCircle,
            {
              borderColor: theme.colors.primary,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <Ionicons name="add" size={26} color={theme.colors.primary} />
        </View>

        <Text
          style={[
            styles.nameText,
            styles.newText,
            { color: theme.colors.primary },
          ]}
          numberOfLines={1}
        >
          New
        </Text>
      </TouchableOpacity>
    );
  };

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
        ListHeaderComponent={renderNewButton}
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
  newButtonCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  nameText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
    textAlign: "center",
  },
  newText: {
    fontWeight: "600",
  },
});
