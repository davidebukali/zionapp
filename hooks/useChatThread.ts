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
  insertMessageInCache,
  markConversationReadInCache,
  normalizeMessage,
  normalizeRecipient,
  updateMessageInCache,
} from "../features/messages/utils";
import {
  messagesApi,
  useGetConversationDetailsQuery,
  useGetConversationsQuery,
  useGetMessageableRecipientsQuery,
  useGetMessagesQuery,
  useMarkConversationAsReadMutation,
  useSendMessageMutation,
  useSendTypingIndicatorMutation,
  useStartOrGetConversationMutation,
} from "../features/messages/api";

export function useChatThread(targetId?: string) {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth?.token);
  const currentUser = useSelector((state: RootState) => state.auth?.user);
  const currentUserId = currentUser?.id ? String(currentUser.id) : undefined;

  // 1. Check local RTK Query caches for existing conversation or recipient
  const { data: cachedInbox } = useGetConversationsQuery(
    { currentUserId },
    { skip: !token }
  );
  const { data: cachedRecipients } = useGetMessageableRecipientsQuery(
    undefined,
    { skip: !token }
  );

  const cachedConversation = useMemo(() => {
    if (!targetId || !cachedInbox?.conversations) return null;
    return (
      cachedInbox.conversations.find(
        (c) => c.participant.id === targetId || c.id === targetId
      ) || null
    );
  }, [targetId, cachedInbox?.conversations]);

  const cachedRecipient = useMemo(() => {
    if (!targetId || !cachedRecipients?.recipients) return null;
    return (
      cachedRecipients.recipients.find((r) => r.id === targetId) || null
    );
  }, [targetId, cachedRecipients?.recipients]);

  // 2. Resolve conversation via cache or POST /conversations
  const [startConversationMutation] = useStartOrGetConversationMutation();
  const [resolvedConversationId, setResolvedConversationId] = useState<
    string | null
  >(cachedConversation?.id || null);
  const [resolvedCanSendMessages, setResolvedCanSendMessages] =
    useState<boolean>(cachedConversation?.canSendMessages !== false);
  const [remoteParticipant, setRemoteParticipant] =
    useState<OnlineContact | null>(
      cachedConversation?.participant || cachedRecipient || null
    );

  useEffect(() => {
    if (cachedConversation) {
      setResolvedConversationId(cachedConversation.id);
      setResolvedCanSendMessages(
        cachedConversation.canSendMessages !== false &&
          !cachedConversation.hasBlockedParticipant
      );
      setRemoteParticipant(cachedConversation.participant);
      return;
    }

    if (cachedRecipient) {
      setRemoteParticipant(cachedRecipient);
    }

    if (!targetId || !token) return;

    let isMounted = true;
    startConversationMutation({ recipient_id: targetId })
      .unwrap()
      .then((conv) => {
        if (!isMounted) return;
        setResolvedConversationId(conv.id);
        setResolvedCanSendMessages(
          conv.can_send_messages !== false && !conv.has_blocked_participant
        );
        setRemoteParticipant(normalizeRecipient(conv.recipient));
      })
      .catch((error) => {
        if (!isMounted) return;
        if (error?.status === 403) {
          setResolvedCanSendMessages(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    targetId,
    cachedConversation,
    cachedRecipient,
    token,
    startConversationMutation,
  ]);

  // Fetch conversation details (can_send_messages / has_blocked_participant) when resolved from cache
  const { data: convDetails } = useGetConversationDetailsQuery(
    resolvedConversationId as string,
    {
      skip: !resolvedConversationId || !token || !cachedConversation,
    }
  );

  useEffect(() => {
    if (convDetails) {
      setResolvedCanSendMessages(
        convDetails.can_send_messages !== false &&
          !convDetails.has_blocked_participant
      );
      if (convDetails.recipient) {
        setRemoteParticipant(normalizeRecipient(convDetails.recipient));
      }
    }
  }, [convDetails]);

  // 3. Participant with clean loading placeholder while POST /conversations is in flight
  const participant: OnlineContact = useMemo(() => {
    if (remoteParticipant) return remoteParticipant;

    return {
      id: targetId || "",
      name: "",
      username: "",
      initials: "",
      isOnline: false,
      avatarColor: getAvatarColor(targetId || ""),
    };
  }, [remoteParticipant, targetId]);

  // 4. Paginated Messages from RTK Query
  const [cursor, setCursor] = useState<string | null>(null);

  useEffect(() => {
    setCursor(null);
  }, [resolvedConversationId]);

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    isFetching: isFetchingMessages,
  } = useGetMessagesQuery(
    {
      conversationId: resolvedConversationId || "",
      cursor,
      currentUserId,
    },
    { skip: !resolvedConversationId || !token }
  );

  const messages: ChatMessage[] = useMemo(
    () => messagesData?.messages ?? [],
    [messagesData?.messages]
  );

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
      markConversationReadInCache(messagesApi, dispatch, resolvedConversationId);
      markAsReadMutation(resolvedConversationId).catch(() => {});
    }
  }, [resolvedConversationId, token, dispatch, markAsReadMutation]);

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
          markConversationReadInCache(
            messagesApi,
            dispatch,
            resolvedConversationId
          );
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

  // Send message via API (optimistic cache insertion handled in api.ts)
  const handleSendMessage = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !resolvedConversationId || !token) return;

    setInputText("");

    try {
      await sendMessageMutation({
        conversationId: resolvedConversationId,
        body: trimmed,
      }).unwrap();
    } catch {
      // Optimistic rollback is handled by sendMessage.onQueryStarted in api.ts
    }
  }, [inputText, resolvedConversationId, token, sendMessageMutation]);

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
    if (messagesData?.nextCursor && !isFetchingMessages) {
      setCursor(messagesData.nextCursor);
    }
  }, [messagesData?.nextCursor, isFetchingMessages]);

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
    isLoadingMore: isFetchingMessages && !isLoadingMessages,
    hasMore: Boolean(messagesData?.nextCursor),
    onLoadMore,
  };
}
