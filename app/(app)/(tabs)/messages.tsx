import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";

import { globalStyles } from "../../../assets/styles/theme";
import { InfiniteScrollList } from "../../../components/InfiniteScrollList";
import { useMessages } from "../../../hooks/useMessages";
import {
  MessagesHeader,
  MessagesSearchBar,
  ActiveContactsTray,
  ConversationListItem,
  MessagesEmptyState,
} from "../../../components/Messages";

export default function MessagesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const {
    searchQuery,
    setSearchQuery,
    handleClearSearch,
    conversations,
    activeContacts,
    handleSelectContact,
    handleSelectConversation,
    isRefreshing,
    onRefresh,
    onLoadMore,
    isLoadingMore,
    hasMore,
  } = useMessages();

  return (
    <View
      style={[
        globalStyles.screen,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Top Navigation Header */}
      <MessagesHeader />

      {/* Main Conversation Feed */}
      <InfiniteScrollList
        data={conversations}
        renderItem={({ item }) => (
          <ConversationListItem
            conversation={item}
            onPress={handleSelectConversation}
          />
        )}
        ListHeaderComponent={
          <View>
            <MessagesSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={handleClearSearch}
            />
            {activeContacts.length > 0 && !searchQuery.trim() && (
              <ActiveContactsTray
                contacts={activeContacts}
                onSelectContact={handleSelectContact}
              />
            )}
          </View>
        }
        ListEmptyComponent={
          <MessagesEmptyState
            searchQuery={searchQuery}
            onResetSearch={handleClearSearch}
          />
        }
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        onLoadMore={onLoadMore}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
