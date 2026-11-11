import React, { useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { Swipeable } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";

import { ChatMessageBubbleProps } from "./types";
import { ChatTextBubble } from "./ChatTextBubble";
import { ChatMediaBubble } from "./ChatMediaBubble";
import { ChatPostCard } from "./ChatPostCard";
import { ChatReactionBadge } from "./ChatReactionBadge";
import { ChatReadReceipt } from "./ChatReadReceipt";
import { ChatReplySnippet } from "./ChatReplySnippet";

const QUICK_REACTION_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];
const QUICK_CAPSULE_WIDTH = 270;
const QUICK_CAPSULE_HEIGHT = 46;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const REPLIED_BUBBLE_MAX_WIDTH = Math.round(SCREEN_WIDTH * 0.78);

export const ChatMessageBubble = React.memo(function ChatMessageBubble({
  message,
  participantName,
  onPressMedia,
  onReply,
  onReact,
  onOpenReactionPicker,
}: ChatMessageBubbleProps) {
  const theme = useTheme();
  const swipeableRef = useRef<Swipeable>(null);
  const bubbleViewRef = useRef<View>(null);

  const [showQuickReactions, setShowQuickReactions] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

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

  const mediaUrls =
    media && media.length > 0
      ? media.map((mediaItem) => mediaItem.url)
      : undefined;

  const handleSwipeOpen = (direction: "left" | "right") => {
    if (direction === "left") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics unavailable in test/web
      }
      onReply?.(message);
      swipeableRef.current?.close();
    }
  };

  const handleLongPress = () => {
    if (isDeletedForEveryone) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics unavailable in test/web
    }
    setShowQuickReactions(true);
    if (bubbleViewRef.current?.measureInWindow) {
      bubbleViewRef.current.measureInWindow((x, y, width, height) => {
        setAnchorPosition({ x, y, width, height });
      });
    }
  };

  const handleSelectQuickEmoji = (emoji: string) => {
    setShowQuickReactions(false);
    onReact?.(messageId, emoji);
  };

  const handlePressMoreReactions = () => {
    setShowQuickReactions(false);
    onOpenReactionPicker?.(messageId);
  };

  const renderLeftActions = () => {
    return (
      <View style={styles.replyActionContainer}>
        <View
          style={[
            styles.replyActionCircle,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <Ionicons
            name="arrow-undo"
            size={18}
            color={theme.colors.primary}
          />
        </View>
      </View>
    );
  };

  const replySenderName =
    replyTo?.sender?.name || (isOutgoing ? "You" : participantName || "User");
  const replySnippetText = replyTo?.is_deleted_for_everyone
    ? "This message was deleted"
    : replyTo?.body;

  // Compute reaction capsule positioning
  const windowDimensions = Dimensions.get("window");
  let capsuleTop = 100;
  let capsuleLeft = 16;
  if (anchorPosition) {
    capsuleTop = anchorPosition.y - QUICK_CAPSULE_HEIGHT - 8;
    if (capsuleTop < 60) {
      capsuleTop = anchorPosition.y + anchorPosition.height + 8;
    }
    if (isOutgoing) {
      capsuleLeft = Math.max(
        16,
        anchorPosition.x + anchorPosition.width - QUICK_CAPSULE_WIDTH
      );
    } else {
      capsuleLeft = Math.min(
        anchorPosition.x,
        windowDimensions.width - QUICK_CAPSULE_WIDTH - 16
      );
    }
  }

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
        renderLeftActions={renderLeftActions}
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
            disabled={isDeletedForEveryone}
          >
            <View ref={bubbleViewRef}>
              {!isDeletedForEveryone && sharedPostId ? (
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
                      text={text!}
                      isOutgoing={isOutgoing}
                      isDeleted={isDeletedForEveryone}
                      isEdited={isEdited}
                    />
                  )}
                  <ChatPostCard postId={sharedPostId} isOutgoing={isOutgoing} />
                </View>
              ) : !isDeletedForEveryone && replyTo ? (
                /* Quoted Reply inside standard bubble */
                <View
                  style={[
                    styles.repliedBubbleContainer,
                    {
                      backgroundColor: isOutgoing
                        ? theme.colors.primary
                        : theme.colors.surfaceVariant,
                      borderBottomRightRadius: isOutgoing ? 4 : 18,
                      borderBottomLeftRadius: isOutgoing ? 18 : 4,
                    },
                  ]}
                >
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
                  {Boolean(text) && (
                    <Text
                      style={[
                        styles.repliedBubbleText,
                        {
                          color: isOutgoing
                            ? theme.colors.onPrimary
                            : theme.colors.onSurface,
                        },
                      ]}
                    >
                      {text}
                      {isEdited && (
                        <Text style={styles.editedTag}> (edited)</Text>
                      )}
                    </Text>
                  )}
                </View>
              ) : !isDeletedForEveryone &&
                (mediaUrl || (mediaUrls && mediaUrls.length > 0)) ? (
                <ChatMediaBubble
                  mediaUrl={mediaUrl}
                  mediaUrls={mediaUrls}
                  onPressMedia={onPressMedia}
                />
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
            </View>
          </TouchableOpacity>

          {!isDeletedForEveryone &&
            ((reactions && reactions.length > 0) ||
              (rawReactions && rawReactions.length > 0)) && (
              <ChatReactionBadge
                reactions={reactions}
                rawReactions={rawReactions}
                onPressReaction={(emoji) => onReact?.(messageId, emoji)}
              />
            )}
        </View>
      </Swipeable>

      {readReceipt && <ChatReadReceipt text={readReceipt} />}

      {/* Quick Reactions Modal */}
      <Modal
        visible={showQuickReactions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQuickReactions(false)}
        statusBarTranslucent
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowQuickReactions(false)}
          accessibilityRole="button"
          accessibilityLabel="Dismiss reactions"
        />
        <View
          style={[
            styles.quickReactionsCapsule,
            {
              top: capsuleTop,
              left: capsuleLeft,
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.outlineVariant,
            },
          ]}
        >
          {QUICK_REACTION_EMOJIS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              accessibilityRole="button"
              accessibilityLabel={`React with ${emoji}`}
              onPress={() => handleSelectQuickEmoji(emoji)}
              style={styles.quickEmojiButton}
            >
              <Text style={styles.quickEmojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="More reactions"
            onPress={handlePressMoreReactions}
            style={styles.quickEmojiButton}
          >
            <Ionicons
              name="add"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>
      </Modal>
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
  repliedBubbleContainer: {
    minWidth: 160,
    maxWidth: REPLIED_BUBBLE_MAX_WIDTH,
    padding: 6,
    borderRadius: 18,
  },
  repliedBubbleText: {
    fontSize: 15,
    lineHeight: 21,
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 4,
  },
  editedTag: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: "italic",
  },
  replyActionContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 48,
    paddingLeft: 12,
  },
  replyActionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  quickReactionsCapsule: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  quickEmojiButton: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  quickEmojiText: {
    fontSize: 22,
  },
});
