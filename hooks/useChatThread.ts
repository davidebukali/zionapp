import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Keyboard } from "react-native";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { EmojiType } from "rn-emoji-keyboard";

import type { RootState, AppDispatch } from "../store/store";
import { getEchoClient } from "../services/echo";
import { TYPING_EXPIRY_MS, TYPING_THROTTLE_MS } from "../constants";
import {
  ChatMessage,
  MessageDeletedEvent,
  MessageReactionUpdatedEvent,
  MessageReadEvent,
  MessageSentEvent,
  MessageUpdatedEvent,
  OnlineContact,
  TypingStartedEvent,
} from "../features/messages/types";
import {
  applyReactionEventToMessage,
  formatMessageTimestamp,
  getAvatarColor,
  getInitials,
  insertMessageInCache,
  normalizeMessage,
  normalizeRecipient,
  updateMessageInCache,
} from "../features/messages/utils";
import {
  messagesApi,
  useGetConversationDetailsQuery,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useMarkConversationAsReadMutation,
  useSendMessageMutation,
  useSendTypingIndicatorMutation,
  useStartOrGetConversationMutation,
} from "../features/messages/api";
import {
  MOCK_ACTIVE_CONTACTS,
  MOCK_CONVERSATIONS,
  MOCK_THREAD_MESSAGES,
} from "../features/messages/mockData";

export function useChatThread(targetId?: string) {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth?.token);
  const currentUser = useSelector((state: RootState) => state.auth?.user);
  const currentUserId = currentUser?.id ? String(currentUser.id) : undefined;

  // 1. Cached conversations lookup
  const { data: cachedInbox } = useGetConversationsQuery(undefined, {
    skip: !token,
  });

  const cachedConversation = useMemo(() => {
    if (!targetId || !cachedInbox?.conversations) return null;
    return (
      cachedInbox.conversations.find(
        (c) => c.participant.id === targetId || c.id === targetId
      ) || null
    );
  }, [targetId, cachedInbox]);

  // 2. Resolve or start conversation via API
  const [startConversationMutation] = useStartOrGetConversationMutation();
  const [resolvedConversationId, setResolvedConversationId] = useState<string | null>(
    cachedConversation?.id || null
  );
  const [resolvedCanSendMessages, setResolvedCanSendMessages] = useState<boolean>(
    cachedConversation?.canSendMessages !== false
  );
  const [remoteParticipant, setRemoteParticipant] = useState<OnlineContact | null>(
    cachedConversation?.participant || null
  );

  useEffect(() => {
    if (cachedConversation) {
      setResolvedConversationId(cachedConversation.id);
      setResolvedCanSendMessages(cachedConversation.canSendMessages !== false);
      setRemoteParticipant(cachedConversation.participant);
      return;
    }

    if (!targetId || !token) return;

    // Call startOrGetConversation (idempotent)
    let isMounted = true;
    startConversationMutation({ recipient_id: targetId })
      .unwrap()
      .then((conv) => {
        if (!isMounted) return;
        setResolvedConversationId(conv.id);
        setResolvedCanSendMessages(conv.can_send_messages !== false);
        setRemoteParticipant(normalizeRecipient(conv.recipient));
      })
      .catch(() => {
        // Fallback: conversation might not exist or network unavailable
      });

    return () => {
      isMounted = false;
    };
  }, [targetId, cachedConversation, token, startConversationMutation]);

  // Optional: details query if needed for permission/block updates
  const { data: convDetails } = useGetConversationDetailsQuery(
    resolvedConversationId as string,
    {
      skip: !resolvedConversationId || !token,
    }
  );

  useEffect(() => {
    if (convDetails) {
      setResolvedCanSendMessages(convDetails.can_send_messages !== false);
      if (convDetails.recipient) {
        setRemoteParticipant(normalizeRecipient(convDetails.recipient));
      }
    }
  }, [convDetails]);

  // 3. Resolve participant with fallback
  const participant: OnlineContact = useMemo(() => {
    if (remoteParticipant) return remoteParticipant;

    const mockConv = MOCK_CONVERSATIONS.find(
      (c) => c.id === targetId || c.participant.id === targetId
    );
    if (mockConv) return mockConv.participant;

    const directContact = MOCK_ACTIVE_CONTACTS.find(
      (c) => c.id === targetId || `conv-new-${c.id}` === targetId
    );
    if (directContact) return directContact;

    if (targetId) {
      return {
        id: targetId,
        name: "User",
        username: "",
        initials: getInitials("User"),
        isOnline: false,
        avatarColor: getAvatarColor(targetId),
      };
    }

    return MOCK_ACTIVE_CONTACTS[0];
  }, [remoteParticipant, targetId]);

  // 4. Messages from RTK Query
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    isFetching: isFetchingMessages,
  } = useGetMessagesQuery(
    { conversationId: resolvedConversationId || "" },
    { skip: !resolvedConversationId || !token }
  );

  // Fallback initial messages from mock
  const fallbackMessages = useMemo(() => {
    if (targetId && MOCK_THREAD_MESSAGES[targetId]) {
      return MOCK_THREAD_MESSAGES[targetId];
    }
    return MOCK_THREAD_MESSAGES["conv-1"] || [];
  }, [targetId]);

  const messages: ChatMessage[] = useMemo(() => {
    if (messagesData?.messages) {
      return messagesData.messages;
    }
    return fallbackMessages;
  }, [messagesData?.messages, fallbackMessages]);

  const [inputText, setInputText] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingTriggerRef = useRef<number>(0);

  // Mutations
  const [sendMessageMutation] = useSendMessageMutation();
  const [markAsReadMutation] = useMarkConversationAsReadMutation();
  const [sendTypingMutation] = useSendTypingIndicatorMutation();

  // Mark conversation as read on entry
  useEffect(() => {
    if (resolvedConversationId && token) {
      markAsReadMutation(resolvedConversationId).catch(() => {});
    }
  }, [resolvedConversationId, token, markAsReadMutation]);

  // 5. Reverb WebSocket Channel Subscription
  useEffect(() => {
    if (!resolvedConversationId || !token) return;

    try {
      const echo = getEchoClient(token);
      const channel = echo.private(`conversations.${resolvedConversationId}`);

      // 1. New message arrives
      channel.listen(".message.sent", (event: MessageSentEvent) => {
        const normalized = normalizeMessage(event, currentUserId);
        insertMessageInCache(
          messagesApi,
          dispatch,
          resolvedConversationId,
          normalized
        );

        if (!normalized.isOutgoing) {
          markAsReadMutation(resolvedConversationId).catch(() => {});
        }
      });

      // 2. Message edited
      channel.listen(".message.updated", (event: MessageUpdatedEvent) => {
        updateMessageInCache(
          messagesApi,
          dispatch,
          resolvedConversationId,
          event.id,
          (msg) => {
            msg.text = event.body || "";
            msg.isEdited = true;
          }
        );
      });

      // 3. Message deleted for everyone
      channel.listen(".message.deleted", (event: MessageDeletedEvent) => {
        updateMessageInCache(
          messagesApi,
          dispatch,
          resolvedConversationId,
          event.id,
          (msg) => {
            msg.text = "This message was deleted";
            msg.mediaUrl = undefined;
            msg.media = [];
            msg.isDeletedForEveryone = true;
          }
        );
      });

      // 4. Reaction updated
      channel.listen(
        ".message.reaction_updated",
        (event: MessageReactionUpdatedEvent) => {
          updateMessageInCache(
            messagesApi,
            dispatch,
            resolvedConversationId,
            event.message_id,
            (msg) => {
              const updated = applyReactionEventToMessage(
                msg,
                event,
                currentUserId
              );
              msg.reactions = updated.reactions;
              msg.rawReactions = updated.rawReactions;
            }
          );
        }
      );

      // 5. Message read by recipient
      channel.listen(".message.read", (event: MessageReadEvent) => {
        updateMessageInCache(
          messagesApi,
          dispatch,
          resolvedConversationId,
          event.last_read_message_id || "",
          (msg) => {
            if (msg.isOutgoing) {
              msg.readReceipt = `Read ${formatMessageTimestamp(event.read_at)}`;
            }
          }
        );
      });

      // 6. Typing started
      channel.listen(".typing.started", (event: TypingStartedEvent) => {
        if (event.user_id === currentUserId) return;

        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, TYPING_EXPIRY_MS);
      });

      return () => {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        echo.leave(`conversations.${resolvedConversationId}`);
      };
    } catch {
      // Gracefully ignore websocket connection failures
    }
  }, [
    resolvedConversationId,
    token,
    currentUserId,
    dispatch,
    markAsReadMutation,
  ]);

  // Outgoing typing notification throttled to 3s
  const handleInputChange = useCallback(
    (text: string) => {
      setInputText(text);

      if (!resolvedConversationId || !token || !text.trim()) return;

      const now = Date.now();
      if (now - lastTypingTriggerRef.current >= TYPING_THROTTLE_MS) {
        lastTypingTriggerRef.current = now;
        sendTypingMutation(resolvedConversationId).catch(() => {});
      }
    },
    [resolvedConversationId, token, sendTypingMutation]
  );

  // Send message
  const handleSendMessage = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    setInputText("");

    if (resolvedConversationId && token) {
      try {
        await sendMessageMutation({
          conversationId: resolvedConversationId,
          body: trimmed,
        }).unwrap();
        return;
      } catch {
        // Handled optimistically / error state
      }
    }

    // Local / fallback mode
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId || "current-user",
      isOutgoing: true,
      text: trimmed,
      timestamp: `${hours}:${minutes}`,
    };

    if (resolvedConversationId) {
      insertMessageInCache(
        messagesApi,
        dispatch,
        resolvedConversationId,
        newMsg
      );
    }
  }, [
    inputText,
    resolvedConversationId,
    token,
    sendMessageMutation,
    currentUserId,
    dispatch,
  ]);

  // Emoji picker
  const handleToggleEmoji = useCallback(() => {
    Keyboard.dismiss();
    setIsEmojiPickerOpen((prev) => !prev);
  }, []);

  const handleEmojiSelected = useCallback((emojiObject: EmojiType) => {
    setInputText((prev) => prev + emojiObject.emoji);
  }, []);

  // Back navigation
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)/(tabs)/messages" as any);
    }
  }, []);

  const onLoadMore = useCallback(() => {
    // Handled via cursor query args when available
  }, []);

  return {
    participant,
    messages,
    inputText,
    setInputText: handleInputChange,
    isTyping,
    setIsTyping,
    isEmojiPickerOpen,
    setIsEmojiPickerOpen,
    handleToggleEmoji,
    handleEmojiSelected,
    handleSendMessage,
    handleBack,
    canSendMessages: resolvedCanSendMessages,
    isLoading: isLoadingMessages,
    isLoadingMore: isFetchingMessages,
    hasMore: Boolean(messagesData?.nextCursor),
    onLoadMore,
  };
}
