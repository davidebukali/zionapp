import React from "react";
import { NewMessageBottomSheet } from "../../Messages/NewMessageBottomSheet";
import { SharePostBottomSheetProps } from "./types";

export const SharePostBottomSheet = React.memo(
  function SharePostBottomSheet({
    visible,
    post,
    recipients,
    searchQuery,
    onChangeSearch,
    onClearSearch,
    onSelectRecipient,
    onClose,
    onLoadMore,
    isLoadingMore,
    hasMore,
  }: SharePostBottomSheetProps) {
    const subtitle = post ? `Post by ${post.author}` : undefined;

    return (
      <NewMessageBottomSheet
        visible={visible}
        title="Share via Direct Message"
        subtitle={subtitle}
        recipients={recipients}
        searchQuery={searchQuery}
        onChangeSearch={onChangeSearch}
        onClearSearch={onClearSearch}
        onSelectRecipient={onSelectRecipient}
        onClose={onClose}
        onLoadMore={onLoadMore}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
      />
    );
  }
);

