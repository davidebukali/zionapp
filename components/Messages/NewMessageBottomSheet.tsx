import React, { useCallback } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";

import { globalStyles } from "../../assets/styles/theme";
import { InfiniteScrollList } from "../InfiniteScrollList";
import { OnlineContact } from "../../features/messages/types";
import { MessageAvatar } from "./MessageAvatar";
import { MessagesSearchBar } from "./MessagesSearchBar";
import { NewMessageBottomSheetProps } from "./types";

export const NewMessageBottomSheet = React.memo(function NewMessageBottomSheet({
  visible,
  recipients,
  searchQuery,
  onChangeSearch,
  onClearSearch,
  onSelectRecipient,
  onClose,
  onLoadMore,
  isLoadingMore,
  hasMore,
}: NewMessageBottomSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const handlePressRecipient = useCallback(
    (contact: OnlineContact) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onSelectRecipient(contact);
    },
    [onSelectRecipient]
  );

  const renderRecipientItem = useCallback(
    ({ item }: { item: OnlineContact }) => (
      <TouchableOpacity
        onPress={() => handlePressRecipient(item)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Message ${item.name}`}
        style={[
          globalStyles.row,
          styles.recipientRow,
          { borderBottomColor: theme.colors.outlineVariant },
        ]}
      >
        <View style={styles.recipientInfo}>
          <MessageAvatar
            name={item.name}
            initials={item.initials}
            avatarUrl={item.avatarUrl}
            avatarColor={item.avatarColor}
            isOnline={item.isOnline}
            size={46}
          />
          <View style={styles.textColumn}>
            <Text
              style={[styles.nameText, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {Boolean(item.username) && (
              <Text
                style={[
                  styles.usernameText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
                numberOfLines={1}
              >
                @{item.username}
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
    ),
    [handlePressRecipient, theme.colors]
  );

  const isSearch = Boolean(searchQuery.trim());

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: theme.colors.backdrop }]}
        onPress={onClose}
      >
        <Pressable
          style={[
            styles.sheetContainer,
            {
              backgroundColor: theme.colors.surface,
              paddingBottom: Math.max(insets.bottom + 12, 20),
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag Handle */}
          <View
            style={[
              styles.dragHandle,
              { backgroundColor: theme.colors.outline },
            ]}
          />

          {/* Sheet Header */}
          <View style={[globalStyles.row, styles.headerRow]}>
            <Text
              style={[
                globalStyles.commentsHeaderTitle,
                { color: theme.colors.onSurface },
              ]}
            >
              New Message
            </Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close new message"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={globalStyles.postIconButton}
            >
              <Ionicons
                name="close"
                size={22}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <MessagesSearchBar
            value={searchQuery}
            onChangeText={onChangeSearch}
            onClear={onClearSearch}
            placeholder="Search following..."
          />

          {/* Recipients List */}
          <InfiniteScrollList
            data={recipients}
            renderItem={renderRecipientItem}
            onLoadMore={onLoadMore}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View
                style={[globalStyles.commentsCenteredState, styles.emptyState]}
              >
                <Ionicons
                  name={isSearch ? "search-outline" : "people-outline"}
                  size={36}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    globalStyles.commentsStateText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {isSearch
                    ? `No matching accounts for "${searchQuery}"`
                    : "Follow accounts to start a conversation."}
                </Text>
              </View>
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 12,
    height: "78%",
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
    opacity: 0.5,
  },
  headerRow: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
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
  emptyState: {
    paddingVertical: 48,
  },
});

