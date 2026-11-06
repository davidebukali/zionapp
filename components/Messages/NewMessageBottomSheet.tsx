import React, { useCallback } from "react";
import { Modal, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";

import { InfiniteScrollList } from "../InfiniteScrollList";
import { OnlineContact } from "../../features/messages/types";
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
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const renderRecipientItem = useCallback(
      ({ item }: { item: OnlineContact }) => (
        <NewMessageRecipientRow contact={item} onPress={onSelectRecipient} />
      ),
      [onSelectRecipient]
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
    height: "78%",
  },
});
