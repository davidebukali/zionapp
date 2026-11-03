import React, { useRef } from "react";
import { FlatList, StyleSheet } from "react-native";

import { ChatMessageListProps } from "./types";
import { ChatDateSeparator } from "./ChatDateSeparator";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { ChatTypingIndicator } from "./ChatTypingIndicator";
import { ChatMessage } from "../../../features/messages/types";

export const ChatMessageList = React.memo(function ChatMessageList({
  messages,
  participant,
  isTyping = true,
  dateLabel = "Today · 9:12",
}: ChatMessageListProps) {
  const listRef = useRef<FlatList<ChatMessage>>(null);

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ChatMessageBubble message={item} />}
      ListHeaderComponent={<ChatDateSeparator label={dateLabel} />}
      ListFooterComponent={
        <ChatTypingIndicator participant={participant} visible={isTyping} />
      }
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

