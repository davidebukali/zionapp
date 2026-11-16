import React, { useRef } from "react";
import { FlatList, StyleSheet } from "react-native";

import { ChatMessageListProps } from "./types";
import { ChatDateSeparator } from "./ChatDateSeparator";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { ChatTypingIndicator } from "./ChatTypingIndicator";
import { ChatMessage } from "../../../features/messages/types";
import {
  getMessageDateHeader,
  shouldShowDateSeparator,
} from "../../../features/messages/utils";

export const ChatMessageList = React.memo(function ChatMessageList({
  messages,
  participant,
  isTyping = true,
  dateLabel = "Today · 9:12",
  onLoadMore,
  isLoadingMore = false,
  hasMore = false,
  onPressMedia,
  onReply,
  onReact,
  onLongPress,
}: ChatMessageListProps) {
  const listRef = useRef<FlatList<ChatMessage>>(null);

  return (
    <FlatList
      ref={listRef}
      data={messages}
      inverted
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => {
        const showDateHeader = shouldShowDateSeparator(messages, index);
        const headerLabel = showDateHeader
          ? getMessageDateHeader(item, dateLabel)
          : "";

        return (
          <>
            {showDateHeader && Boolean(headerLabel) && (
              <ChatDateSeparator label={headerLabel} />
            )}
            <ChatMessageBubble
              message={item}
              participantName={participant.name}
              onPressMedia={onPressMedia}
              onReply={onReply}
              onReact={onReact}
              onLongPress={onLongPress}
            />
          </>
        );
      }}
      ListHeaderComponent={
        <ChatTypingIndicator participant={participant} visible={isTyping} />
      }
      ListFooterComponent={
        messages.length === 0 && dateLabel ? (
          <ChatDateSeparator label={dateLabel} />
        ) : null
      }
      onEndReached={hasMore && !isLoadingMore ? onLoadMore : undefined}
      onEndReachedThreshold={0.2}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: 12,
  },
});
