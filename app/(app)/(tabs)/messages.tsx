import React, { useCallback } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useTheme } from "react-native-paper";

import { globalStyles } from "../../../assets/styles/theme";
import { InfiniteScrollList } from "../../../components/InfiniteScrollList";
import { useMessages } from "../../../hooks/useMessages";
import { Conversation, OnlineContact } from "../../../features/messages/types";
import {
  MessagesSearchBar,
  ActiveContactsTray,
  ConversationListItem,
  MessagesEmptyState,
  NewMessageBottomSheet,
} from "../../../components/Messages";

export default function MessagesScreen() {
  const theme = useTheme();

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
    isComposeOpen,
    handleOpenCompose,
    handleCloseCompose,
    recipientSearchQuery,
    setRecipientSearchQuery,
    handleClearRecipientSearch,
    filteredRecipients,
    onLoadMoreRecipients,
    isLoadingMoreRecipients,
    hasMoreRecipients,
  } = useMessages();

  const handleOpenConversation = useCallback(
    (conversation: Conversation) => {
      const targetUserId = handleSelectConversation(conversation);
      router.push(`/messages/${targetUserId}` as any);
    },
    [handleSelectConversation]
  );

  const handleOpenContact = useCallback(
    (contact: OnlineContact) => {
      handleCloseCompose();
      const targetUserId = handleSelectContact(contact);
      router.push(`/messages/${targetUserId}` as any);
    },
    [handleCloseCompose, handleSelectContact]
  );

  return (
    <View
      style={[
        globalStyles.screen,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      {/* Main Conversation Feed */}
      <InfiniteScrollList
        data={conversations}
        renderItem={({ item }) => (
          <ConversationListItem
            conversation={item}
            onPress={handleOpenConversation}
          />
        )}
        ListHeaderComponent={
          <View>
            <MessagesSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={handleClearSearch}
            />
            {!searchQuery.trim() && (
              <ActiveContactsTray
                contacts={activeContacts}
                onSelectContact={handleOpenContact}
                onPressCompose={handleOpenCompose}
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

      {/* New Message Recipient Picker Bottom Sheet */}
      <NewMessageBottomSheet
        visible={isComposeOpen}
        recipients={filteredRecipients}
        searchQuery={recipientSearchQuery}
        onChangeSearch={setRecipientSearchQuery}
        onClearSearch={handleClearRecipientSearch}
        onSelectRecipient={handleOpenContact}
        onClose={handleCloseCompose}
        onLoadMore={onLoadMoreRecipients}
        isLoadingMore={isLoadingMoreRecipients}
        hasMore={hasMoreRecipients}
      />
    </View>
  );
}
