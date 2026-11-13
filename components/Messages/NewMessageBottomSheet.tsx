import React, { useCallback } from "react";
import { StyleSheet } from "react-native";

import { InfiniteScrollList } from "../InfiniteScrollList";
import { OnlineContact } from "../../features/messages/types";
import { BottomSheet } from "../Common/BottomSheet";
import { MessagesSearchBar } from "./MessagesSearchBar";
import { NewMessageSheetHeader } from "./NewMessageSheetHeader";
import { NewMessageRecipientRow } from "./NewMessageRecipientRow";
import { NewMessageEmptyState } from "./NewMessageEmptyState";
import { NewMessageBottomSheetProps } from "./types";

export const NewMessageBottomSheet = React.memo(
  function NewMessageBottomSheet({
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
    title,
    subtitle,
  }: NewMessageBottomSheetProps) {
    const renderRecipientItem = useCallback(
      ({ item }: { item: OnlineContact }) => (
        <NewMessageRecipientRow contact={item} onPress={onSelectRecipient} />
      ),
      [onSelectRecipient]
    );

    return (
      <BottomSheet
        visible={visible}
        onClose={onClose}
        hideHeader
        hideDragHandle
        sheetStyle={styles.sheetContainer}
      >
        {/* Header: Drag Handle, Title, Subtitle & Close Button */}
        <NewMessageSheetHeader
          title={title}
          subtitle={subtitle}
          onClose={onClose}
        />

        {/* Recipient Search Bar */}
        <MessagesSearchBar
          value={searchQuery}
          onChangeText={onChangeSearch}
          onClear={onClearSearch}
          placeholder="Search following..."
        />

        {/* Virtualized Recipients List */}
        <InfiniteScrollList
          data={recipients}
          renderItem={renderRecipientItem}
          onLoadMore={onLoadMore}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <NewMessageEmptyState searchQuery={searchQuery} />
          }
        />
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  sheetContainer: {
    height: "78%",
  },
});
