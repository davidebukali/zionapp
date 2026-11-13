import React, { useCallback, useRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { isPendingMessage } from "../../../features/messages/utils";
import { ChatMessageBubbleProps } from "./types";
import { ChatTextBubble } from "./ChatTextBubble";
import { ChatMediaBubble } from "./ChatMediaBubble";
import { ChatPostCard } from "./ChatPostCard";
import { ChatReactionBadge } from "./ChatReactionBadge";
import { ChatReadReceipt } from "./ChatReadReceipt";
import {
  ChatReplySnippet,
  ChatSwipeReplyAction,
} from "./ChatReplySnippet";

export const ChatMessageBubble = React.memo(function ChatMessageBubble({
  message,
  participantName,
  onPressMedia,
  onReply,
  onReact,
  onLongPress,
}: ChatMessageBubbleProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const {
    id: messageId,
    isOutgoing,
    text,
    sharedPostId,
    mediaUrl,
    media,
    reactions,
    rawReactions,
    replyTo,
    readReceipt,
    isDeletedForEveryone,
    isEdited,
  } = message;

  const isPending = isPendingMessage(message);

  const mediaUrls =
    media && media.length > 0
      ? media.map((mediaItem) => mediaItem.url)
      : undefined;

  const handleSwipeOpen = useCallback(
    (direction: "left" | "right") => {
      if (direction === "left") {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {
          // Haptics unavailable in test/web
        }
        onReply?.(message);
        swipeableRef.current?.close();
      }
    },
    [message, onReply]
  );

  const handleLongPress = useCallback(() => {
    if (isDeletedForEveryone || isPending) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics unavailable in test/web
    }
    onLongPress?.(message);
  }, [isDeletedForEveryone, isPending, message, onLongPress]);

  const replySenderName =
    replyTo?.sender?.name || (isOutgoing ? "You" : participantName || "User");
  const replySnippetText = replyTo?.is_deleted_for_everyone
    ? "This message was deleted"
    : replyTo?.body;

  const hasReactions = Boolean(
    !isDeletedForEveryone &&
      ((reactions && reactions.length > 0) ||
        (rawReactions && rawReactions.length > 0))
  );

  return (
    <View
      style={[
        styles.row,
        isOutgoing ? styles.rowOutgoing : styles.rowIncoming,
      ]}
    >
      <Swipeable
        ref={swipeableRef}
        containerStyle={[
          styles.swipeableContainer,
          { alignSelf: isOutgoing ? "flex-end" : "flex-start" },
        ]}
        childrenContainerStyle={[
          styles.swipeableChildren,
          { alignSelf: isOutgoing ? "flex-end" : "flex-start" },
        ]}
        renderLeftActions={() => <ChatSwipeReplyAction />}
        onSwipeableOpen={handleSwipeOpen}
        friction={2}
        overshootLeft={false}
        enabled={!isDeletedForEveryone && Boolean(onReply)}
      >
        <View
          style={[
            styles.bubbleWrapper,
            { alignSelf: isOutgoing ? "flex-end" : "flex-start" },
            hasReactions && styles.bubbleWrapperWithReactions,
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            delayLongPress={250}
            onLongPress={handleLongPress}
            disabled={isDeletedForEveryone || isPending}
          >
            <View>
              {!isDeletedForEveryone && sharedPostId ? (
                /* Post share bubble with post card & optional reply */
                <View
                  style={[
                    styles.sharedPostWrapper,
                    isOutgoing ? styles.wrapperOutgoing : styles.wrapperIncoming,
                  ]}
                >
                  {replyTo && (
                    <ChatReplySnippet
                      senderName={replySenderName}
                      text={replySnippetText}
                      mediaUrl={replyTo.mediaUrl}
                      isOutgoingBubble={isOutgoing}
                    />
                  )}
                  {Boolean(text) && (
                    <ChatTextBubble
                      text={text}
                      isOutgoing={isOutgoing}
                      isDeleted={isDeletedForEveryone}
                      isEdited={isEdited}
                    />
                  )}
                  <ChatPostCard postId={sharedPostId} isOutgoing={isOutgoing} />
                </View>
              ) : !isDeletedForEveryone && replyTo ? (
                /* Quoted reply rendered inside unified ChatTextBubble */
                <ChatTextBubble
                  text={text}
                  isOutgoing={isOutgoing}
                  isDeleted={isDeletedForEveryone}
                  isEdited={isEdited}
                  header={
                    <>
                      <ChatReplySnippet
                        senderName={replySenderName}
                        text={replySnippetText}
                        mediaUrl={replyTo.mediaUrl}
                        isOutgoingBubble={isOutgoing}
                      />
                      {Boolean(mediaUrl || (mediaUrls && mediaUrls.length > 0)) && (
                        <ChatMediaBubble
                          mediaUrl={mediaUrl}
                          mediaUrls={mediaUrls}
                          onPressMedia={onPressMedia}
                        />
                      )}
                    </>
                  }
                />
              ) : !isDeletedForEveryone &&
                (mediaUrl || (mediaUrls && mediaUrls.length > 0)) ? (
                /* Standalone media attachment */
                <ChatMediaBubble
                  mediaUrl={mediaUrl}
                  mediaUrls={mediaUrls}
                  onPressMedia={onPressMedia}
                />
              ) : (
                /* Standard text message bubble */
                <ChatTextBubble
                  text={text}
                  isOutgoing={isOutgoing}
                  isDeleted={isDeletedForEveryone}
                  isEdited={isEdited}
                />
              )}
            </View>
          </TouchableOpacity>

          {!isDeletedForEveryone && hasReactions && (
            <ChatReactionBadge
              rawReactions={rawReactions}
              reactions={reactions}
              onPressReaction={(emoji) => onReact?.(messageId, emoji)}
            />
          )}
        </View>
      </Swipeable>

      {readReceipt && <ChatReadReceipt text={readReceipt} />}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    width: "100%",
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  rowIncoming: {
    alignItems: "flex-start",
  },
  rowOutgoing: {
    alignItems: "flex-end",
  },
  swipeableContainer: {
    overflow: "visible",
  },
  swipeableChildren: {
    overflow: "visible",
  },
  bubbleWrapper: {
    position: "relative",
  },
  bubbleWrapperWithReactions: {
    paddingBottom: 12,
  },
  sharedPostWrapper: {
    gap: 4,
  },
  wrapperIncoming: {
    alignItems: "flex-start",
  },
  wrapperOutgoing: {
    alignItems: "flex-end",
  },
});
