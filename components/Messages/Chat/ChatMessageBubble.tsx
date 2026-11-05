import React from "react";
import { StyleSheet, View } from "react-native";

import { ChatMessageBubbleProps } from "./types";
import { ChatTextBubble } from "./ChatTextBubble";
import { ChatMediaBubble } from "./ChatMediaBubble";
import { ChatReactionBadge } from "./ChatReactionBadge";
import { ChatReadReceipt } from "./ChatReadReceipt";

export const ChatMessageBubble = React.memo(function ChatMessageBubble({
  message,
}: ChatMessageBubbleProps) {
  const {
    isOutgoing,
    text,
    mediaUrl,
    media,
    reactions,
    readReceipt,
    isDeletedForEveryone,
    isEdited,
  } = message;

  const mediaUrls =
    media && media.length > 0 ? media.map((m) => m.url) : undefined;

  return (
    <View
      style={[
        styles.row,
        isOutgoing ? styles.rowOutgoing : styles.rowIncoming,
      ]}
    >
      <View style={styles.bubbleWrapper}>
        {!isDeletedForEveryone && (mediaUrl || (mediaUrls && mediaUrls.length > 0)) ? (
          <ChatMediaBubble mediaUrl={mediaUrl} mediaUrls={mediaUrls} />
        ) : (
          text && (
            <ChatTextBubble
              text={text}
              isOutgoing={isOutgoing}
              isDeleted={isDeletedForEveryone}
              isEdited={isEdited}
            />
          )
        )}

        {!isDeletedForEveryone && reactions && reactions.length > 0 && (
          <ChatReactionBadge reactions={reactions} />
        )}
      </View>

      {readReceipt && <ChatReadReceipt text={readReceipt} />}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  rowIncoming: {
    alignItems: "flex-start",
  },
  rowOutgoing: {
    alignItems: "flex-end",
  },
  bubbleWrapper: {
    position: "relative",
  },
});
