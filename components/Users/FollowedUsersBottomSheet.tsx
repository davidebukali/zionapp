import React, { useCallback } from "react";
import {
  ActivityIndicator,
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

import { globalStyles } from "../../assets/styles/theme";
import { useFollowedUsersSheet } from "../../hooks/useFollowedUsersSheet";
import { TaggableUser } from "../../features/users/types";
import { InfiniteScrollList } from "../InfiniteScrollList";
import { FollowedUsersBottomSheetProps } from "./types";
import { TaggableUserItem } from "./TaggableUserItem";
import { TaggableUsersSearchBar } from "./TaggableUsersSearchBar";

export const FollowedUsersBottomSheet = React.memo(
  function FollowedUsersBottomSheet({
    visible,
    onClose,
    onSelectUser,
  }: FollowedUsersBottomSheetProps) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const {
      searchQuery,
      setSearchQuery,
      debouncedQuery,
      users,
      hasMore,
      isLoading,
      isLoadingMore,
      isSearching,
      handleLoadMore,
      handleSelectUser,
    } = useFollowedUsersSheet({ visible, onSelectUser, onClose });

    const renderUserItem = useCallback(
      ({ item }: { item: TaggableUser }) => (
        <TaggableUserItem user={item} onPress={handleSelectUser} />
      ),
      [handleSelectUser]
    );

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
            onPress={(event) => event.stopPropagation()}
          >
            {/* Drag Handle */}
            <View
              style={[
                styles.dragHandle,
                { backgroundColor: theme.colors.outline },
              ]}
            />

            {/* Header */}
            <View style={[globalStyles.row, styles.headerRow]}>
              <Text
                style={[
                  globalStyles.commentsHeaderTitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                Tag People
              </Text>
              <TouchableOpacity
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close tag people"
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
            <TaggableUsersSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery("")}
            />

            {/* Users List */}
            {isLoading && users.length === 0 ? (
              <View style={[globalStyles.commentsCenteredState, styles.loadingState]}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : (
              <InfiniteScrollList
                data={users}
                renderItem={renderUserItem}
                onLoadMore={handleLoadMore}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View
                    style={[
                      globalStyles.commentsCenteredState,
                      styles.emptyState,
                    ]}
                  >
                    <Ionicons
                      name={isSearching ? "search-outline" : "people-outline"}
                      size={36}
                      color={theme.colors.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        globalStyles.commentsStateText,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {isSearching
                        ? `No matching users for "${debouncedQuery}"`
                        : "No taggable people found."}
                    </Text>
                  </View>
                }
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 12,
    height: "75%",
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
    marginBottom: 8,
  },
  emptyState: {
    paddingVertical: 48,
  },
  loadingState: {
    paddingVertical: 48,
  },
});
