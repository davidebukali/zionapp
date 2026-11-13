import React, { useCallback } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../../assets/styles/theme";
import { useFollowedUsersSheet } from "../../hooks/useFollowedUsersSheet";
import { TaggableUser } from "../../features/users/types";
import { InfiniteScrollList } from "../InfiniteScrollList";
import { BottomSheet } from "../Common/BottomSheet";
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
      <BottomSheet
        visible={visible}
        onClose={onClose}
        title="Tag People"
        closeAccessibilityLabel="Close tag people"
        sheetStyle={styles.sheetContainer}
        contentStyle={styles.contentFlex}
      >
        {/* Search Bar */}
        <TaggableUsersSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
        />

        {/* Users List */}
        {isLoading && users.length === 0 ? (
          <View
            style={[globalStyles.commentsCenteredState, styles.loadingState]}
          >
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
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  sheetContainer: {
    height: "75%",
  },
  contentFlex: {
    flex: 1,
  },
  emptyState: {
    paddingVertical: 48,
  },
  loadingState: {
    paddingVertical: 48,
  },
});
