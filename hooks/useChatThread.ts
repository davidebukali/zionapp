import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Alert, Keyboard } from "react-native";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { EmojiType } from "rn-emoji-keyboard";

import type { RootState, AppDispatch } from "../store/store";
import { getEchoClient } from "../services/echo";
import { MAX_CHAT_MEDIA, TYPING_EXPIRY_MS, TYPING_THROTTLE_MS } from "../constants";
import {
  ChatMessage,
  MessageDeletedEvent,
  MessageReactionUpdatedEvent,
  MessageReadEvent,
  MessageSentEvent,
  MessageUpdatedEvent,
  OnlineContact,
  PresenceMember,
  ReportReason,
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
  useArchiveConversationMutation,
  useDeleteConversationMutation,
  useGetConversationDetailsQuery,
  useGetConversationsQuery,
  useGetMessageableRecipientsQuery,
  useGetMessagesQuery,
  useMarkConversationAsReadMutation,
  useMuteConversationMutation,
  useReactToMessageMutation,
  useRemoveMessageReactionMutation,
  useReportConversationMutation,
  useSendMessageMutation,
  useSendTypingIndicatorMutation,
  useStartOrGetConversationMutation,
  useUnarchiveConversationMutation,
  useUnmuteConversationMutation,
} from "../features/messages/api";
import {
  useBlockUserMutation,
  useUnblockUserMutation,
} from "../features/users/api";
import {
  useConfirmMediaUploadMutation,
  useGetMediaUploadUrlMutation,
  useLazyGetMediaStatusQuery,
} from "../features/posts/api";
import { MediaItem, uploadAndProcessMedia } from "../utils/mediaUploader";
import { pickImageFromLibrary } from "../utils/mediaPicker";

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

  const onlineUserIds = useSelector(
    (state: RootState) => state.presence?.onlineUserIds ?? []
  );
  const [isPartnerInChat, setIsPartnerInChat] = useState(false);

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

  const partnerId = remoteParticipant?.id || targetId;

  const isPartnerOnline = useMemo(() => {
    if (isPartnerInChat) return true;
    if (!partnerId) return false;
    return onlineUserIds.includes(String(partnerId));
  }, [isPartnerInChat, partnerId, onlineUserIds]);

  // Thread options & states
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(Boolean(cachedConversation?.isMuted));
  const [isArchived, setIsArchived] = useState(Boolean(cachedConversation?.isArchived));
  const [isBlocked, setIsBlocked] = useState(Boolean(cachedConversation?.hasBlockedParticipant));

  // Attached media states (Max 4 images, no captions)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState<string | null>(null);

  // Reply and Reaction states
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [reactingToMessageId, setReactingToMessageId] = useState<string | null>(
    null
  );

  // Additional Mutations
  const [muteMutation] = useMuteConversationMutation();
  const [unmuteMutation] = useUnmuteConversationMutation();
  const [archiveMutation] = useArchiveConversationMutation();
  const [unarchiveMutation] = useUnarchiveConversationMutation();
  const [deleteConversationMutation] = useDeleteConversationMutation();
  const [reportConversationMutation] = useReportConversationMutation();
  const [reactToMessageMutation] = useReactToMessageMutation();
  const [removeMessageReactionMutation] = useRemoveMessageReactionMutation();
  const [blockUserMutation] = useBlockUserMutation();
  const [unblockUserMutation] = useUnblockUserMutation();
  const [getMediaUploadUrl] = useGetMediaUploadUrlMutation();
  const [confirmMediaUpload] = useConfirmMediaUploadMutation();
  const [getMediaStatus] = useLazyGetMediaStatusQuery();

  useEffect(() => {
    if (cachedConversation) {
      setResolvedConversationId(cachedConversation.id);
      setIsMuted(Boolean(cachedConversation.isMuted));
      setIsArchived(Boolean(cachedConversation.isArchived));
      setIsBlocked(Boolean(cachedConversation.hasBlockedParticipant));
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
        setIsMuted(Boolean(conv.is_muted));
        setIsArchived(Boolean(conv.is_archived));
        setIsBlocked(Boolean(conv.has_blocked_participant));
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
      setIsMuted(Boolean(convDetails.is_muted));
      setIsArchived(Boolean(convDetails.is_archived));
      setIsBlocked(Boolean(convDetails.has_blocked_participant));
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
    if (remoteParticipant) {
      return {
        ...remoteParticipant,
        isOnline: isPartnerOnline,
      };
    }

    return {
      id: targetId || "",
      name: "",
      username: "",
      initials: "",
      isOnline: isPartnerOnline,
      avatarColor: getAvatarColor(targetId || ""),
    };
  }, [remoteParticipant, targetId, isPartnerOnline]);

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
    {
      skip: !resolvedConversationId || !token,
      refetchOnMountOrArgChange: true,
    }
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

  // 5. Reverb WebSocket Channel Subscription (Data Layer & Presence Layer)
  useEffect(() => {
    if (!resolvedConversationId || !token) return;

    try {
      const echo = getEchoClient(token);

      // 1. DATA LAYER (Private Channel)
      const privateChannel = echo.private(`conversations.${resolvedConversationId}`);

      // 1.1 New message arrives
      privateChannel.listen(".message.sent", (event: MessageSentEvent) => {
        const normalized = normalizeMessage(event, currentUserId);

        insertMessageInCache(
          messagesApi,
          dispatch,
          resolvedConversationId,
          normalized
        );

        if (String(event.sender_id) !== String(currentUserId)) {
          markConversationReadInCache(
            messagesApi,
            dispatch,
            resolvedConversationId
          );
          markAsReadMutation(resolvedConversationId).catch(() => {});
        }
      });

      // 1.2 Message edited
      privateChannel.listen(".message.updated", (event: MessageUpdatedEvent) => {
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

      // 1.3 Message deleted for everyone
      privateChannel.listen(".message.deleted", (event: MessageDeletedEvent) => {
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

      // 1.4 Reaction updated (support both broadcast naming formats)
      const handleReactionUpdated = (event: MessageReactionUpdatedEvent) => {
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
      };

      privateChannel.listen(".message.reaction.updated", handleReactionUpdated);
      privateChannel.listen(".message.reaction_updated", handleReactionUpdated);

      // 1.5 Message read by recipient
      privateChannel.listen(".message.read", (event: MessageReadEvent) => {
        if (partnerId && String(event.reader_id) !== String(partnerId)) {
          return;
        }

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

      // 1.6 Typing started
      privateChannel.listen(".typing.started", (event: TypingStartedEvent) => {
        const typingUserId = event.user?.id ?? event.user_id;

        if (!typingUserId || String(typingUserId) === String(currentUserId)) return;
        if (partnerId && String(typingUserId) !== String(partnerId)) return;

        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, TYPING_EXPIRY_MS);
      });

      // 2. PRESENCE LAYER (In-Room Presence Channel)
      const presenceChannel = echo.join(`conversations.${resolvedConversationId}`);

      presenceChannel.here((users: PresenceMember[]) => {
        if (Array.isArray(users) && partnerId) {
          setIsPartnerInChat(
            users.some((member) => String(member.id) === String(partnerId))
          );
        }
      });

      presenceChannel.joining((member: PresenceMember) => {
        if (partnerId && String(member?.id) === String(partnerId)) {
          setIsPartnerInChat(true);
        }
      });

      presenceChannel.leaving((member: PresenceMember) => {
        if (partnerId && String(member?.id) === String(partnerId)) {
          setIsPartnerInChat(false);
        }
      });

      return () => {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setIsPartnerInChat(false);
        echo.leave(`conversations.${resolvedConversationId}`);
      };
    } catch (error) {
      console.warn("[WS:Chat] Setup error:", error);
    }
  }, [
    resolvedConversationId,
    token,
    currentUserId,
    partnerId,
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

  // Media picker (max 4 images, no captions: clears text input)
  const handlePickMedia = useCallback(async () => {
    if (selectedMedia.length >= MAX_CHAT_MEDIA) {
      Alert.alert("Limit Reached", `You can attach up to ${MAX_CHAT_MEDIA} images.`);
      return;
    }

    const assets = await pickImageFromLibrary({
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: MAX_CHAT_MEDIA - selectedMedia.length,
      quality: 0.8,
    });

    if (assets && assets.length > 0) {
      const newItems: MediaItem[] = assets.map((asset) => ({
        uri: asset.uri,
        filename: asset.fileName || undefined,
        mimeType: asset.mimeType || undefined,
        fileSize: asset.fileSize || undefined,
      }));
      // Enforce no captions: clear text input when images are selected
      setInputText("");
      setSelectedMedia((prev) => [...prev, ...newItems].slice(0, MAX_CHAT_MEDIA));
    }
  }, [selectedMedia.length]);

  const handleRemoveMedia = useCallback((index: number) => {
    setSelectedMedia((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  // Send message via API (supporting images or text)
  const handleSendMessage = useCallback(async () => {
    if (!resolvedConversationId || !token) return;

    const trimmed = inputText.trim();
    const hasImages = selectedMedia.length > 0;

    if (!trimmed && !hasImages) return;

    // Reset input states
    setInputText("");
    const mediaToSend = [...selectedMedia];
    setSelectedMedia([]);
    const replyTarget = replyingTo;
    setReplyingTo(null);

    try {
      let uploadedMediaIds: string[] | undefined = undefined;

      if (hasImages) {
        setIsUploadingMedia(true);
        uploadedMediaIds = await uploadAndProcessMedia(
          mediaToSend,
          { getMediaUploadUrl, confirmMediaUpload, getMediaStatus },
          setUploadStatusText
        );
      }

      await sendMessageMutation({
        conversationId: resolvedConversationId,
        body: hasImages ? undefined : trimmed,
        media_ids: uploadedMediaIds,
        optimisticMediaUrls: hasImages ? mediaToSend.map((m) => m.uri) : undefined,
        reply_to_message_id: replyTarget?.id,
        optimisticReplyTo: replyTarget
          ? {
              id: replyTarget.id,
              sender: {
                id: replyTarget.senderId,
                name: replyTarget.isOutgoing ? "You" : participant.name,
              },
              body:
                replyTarget.text ||
                (replyTarget.sharedPostId ? "Shared post" : null),
              mediaUrl: replyTarget.mediaUrl || replyTarget.media?.[0]?.url,
              is_deleted_for_everyone: false,
            }
          : null,
      }).unwrap();
    } catch (error: any) {
      const message =
        error?.data?.message || error?.message || "Failed to send message.";
      Alert.alert("Error", message);
    } finally {
      setIsUploadingMedia(false);
      setUploadStatusText(null);
    }
  }, [
    inputText,
    selectedMedia,
    replyingTo,
    participant.name,
    resolvedConversationId,
    token,
    sendMessageMutation,
    getMediaUploadUrl,
    confirmMediaUpload,
    getMediaStatus,
  ]);

  // Thread options handlers
  const handleOpenOptions = useCallback(() => {
    setIsOptionsOpen(true);
  }, []);

  const handleCloseOptions = useCallback(() => {
    setIsOptionsOpen(false);
  }, []);

  const handleToggleMute = useCallback(async () => {
    if (!resolvedConversationId || !token) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    try {
      if (nextMuted) {
        await muteMutation(resolvedConversationId).unwrap();
      } else {
        await unmuteMutation(resolvedConversationId).unwrap();
      }
    } catch {
      setIsMuted(!nextMuted);
    }
  }, [resolvedConversationId, token, isMuted, muteMutation, unmuteMutation]);

  const handleToggleArchive = useCallback(async () => {
    if (!resolvedConversationId || !token) return;
    const nextArchived = !isArchived;
    setIsArchived(nextArchived);
    try {
      if (nextArchived) {
        await archiveMutation(resolvedConversationId).unwrap();
      } else {
        await unarchiveMutation(resolvedConversationId).unwrap();
      }
    } catch {
      setIsArchived(!nextArchived);
    }
  }, [resolvedConversationId, token, isArchived, archiveMutation, unarchiveMutation]);

  const handleClearHistory = useCallback(() => {
    if (!resolvedConversationId || !token) return;

    Alert.alert(
      "Clear Chat History?",
      "This will remove the conversation history for your account.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            handleCloseOptions();
            try {
              await deleteConversationMutation(resolvedConversationId).unwrap();
              router.replace("/(app)/(tabs)/messages" as any);
            } catch {
              Alert.alert("Error", "Could not clear chat history.");
            }
          },
        },
      ]
    );
  }, [resolvedConversationId, token, deleteConversationMutation, handleCloseOptions]);

  const handleReport = useCallback(
    async (reason: ReportReason) => {
      if (!resolvedConversationId || !token) return;
      handleCloseOptions();
      try {
        await reportConversationMutation({
          id: resolvedConversationId,
          reason,
        }).unwrap();
        Alert.alert(
          "Report Submitted",
          "Thank you for helping keep Tsiyon safe. We will review this conversation."
        );
      } catch {
        Alert.alert("Error", "Could not submit report. Please try again.");
      }
    },
    [resolvedConversationId, token, reportConversationMutation, handleCloseOptions]
  );

  const handleToggleBlock = useCallback(async () => {
    const targetUserId = participant.id || targetId;
    if (!targetUserId || !token) return;

    if (isBlocked) {
      // Unblock
      try {
        await unblockUserMutation(targetUserId).unwrap();
        setIsBlocked(false);
        setResolvedCanSendMessages(true);
      } catch {
        Alert.alert("Error", "Could not unblock user.");
      }
      return;
    }

    // Block with confirmation
    Alert.alert(
      `Block ${participant.name || "User"}?`,
      "They will not be able to send you messages or view your updates.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            handleCloseOptions();
            try {
              await blockUserMutation(targetUserId).unwrap();
              setIsBlocked(true);
              setResolvedCanSendMessages(false);
            } catch {
              Alert.alert("Error", "Could not block user.");
            }
          },
        },
      ]
    );
  }, [
    participant.id,
    participant.name,
    targetId,
    token,
    isBlocked,
    unblockUserMutation,
    blockUserMutation,
    handleCloseOptions,
  ]);

  // Reply handlers
  const handleReplyToMessage = useCallback((message: ChatMessage) => {
    setReplyingTo(message);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleOpenReactionPicker = useCallback((messageId: string) => {
    setReactingToMessageId(messageId);
    setIsEmojiPickerOpen(true);
  }, []);

  const handleToggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!resolvedConversationId || !token) return;

      const targetMessage = messages.find((msg) => msg.id === messageId);
      const existingReaction = targetMessage?.rawReactions?.find(
        (reaction) => reaction.emoji === emoji
      );
      const hasUserReacted = existingReaction
        ? existingReaction.user_reacted
        : false;

      // Optimistically update local RTK Query cache
      updateMessageInCache(
        messagesApi,
        dispatch,
        resolvedConversationId,
        messageId,
        (msg) => {
          const fakeEvent: MessageReactionUpdatedEvent = {
            message_id: messageId,
            conversation_id: resolvedConversationId,
            emoji: hasUserReacted ? null : emoji,
            user_id: currentUserId,
          };
          const updated = applyReactionEventToMessage(
            msg,
            fakeEvent,
            currentUserId
          );
          msg.reactions = updated.reactions;
          msg.rawReactions = updated.rawReactions;
        }
      );

      try {
        if (hasUserReacted) {
          await removeMessageReactionMutation({
            messageId,
            conversationId: resolvedConversationId,
          }).unwrap();
        } else {
          await reactToMessageMutation({
            messageId,
            conversationId: resolvedConversationId,
            emoji,
          }).unwrap();
        }
      } catch {
        // Optimistic rollback not strictly necessary on minor failure
      }
    },
    [
      resolvedConversationId,
      token,
      messages,
      dispatch,
      currentUserId,
      removeMessageReactionMutation,
      reactToMessageMutation,
    ]
  );

  // Emoji picker
  const handleToggleEmoji = useCallback(() => {
    Keyboard.dismiss();
    setReactingToMessageId(null);
    setIsEmojiPickerOpen((prev) => !prev);
  }, []);

  const handleEmojiSelected = useCallback(
    (emojiObject: EmojiType) => {
      if (reactingToMessageId) {
        handleToggleReaction(reactingToMessageId, emojiObject.emoji);
        setReactingToMessageId(null);
        setIsEmojiPickerOpen(false);
      } else {
        setInputText((prev) => prev + emojiObject.emoji);
      }
    },
    [reactingToMessageId, handleToggleReaction]
  );

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

  // 12. Fullscreen Media Preview State
  const [previewMediaUrls, setPreviewMediaUrls] = useState<string[]>([]);
  const [previewMediaIndex, setPreviewMediaIndex] = useState<number | null>(null);

  const handleOpenMediaPreview = useCallback((urls: string[], index = 0) => {
    setPreviewMediaUrls(urls);
    setPreviewMediaIndex(index);
  }, []);

  const handleCloseMediaPreview = useCallback(() => {
    setPreviewMediaIndex(null);
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
    isLoadingMore: isFetchingMessages && !isLoadingMessages,
    hasMore: Boolean(messagesData?.nextCursor),
    onLoadMore,
    isOptionsOpen,
    isMuted,
    isArchived,
    isBlocked,
    handleOpenOptions,
    handleCloseOptions,
    handleToggleMute,
    handleToggleArchive,
    handleClearHistory,
    handleReport,
    handleToggleBlock,
    selectedMedia,
    handlePickMedia,
    handleRemoveMedia,
    isUploadingMedia,
    uploadStatusText,
    previewMediaUrls,
    previewMediaIndex,
    handleOpenMediaPreview,
    handleCloseMediaPreview,
    replyingTo,
    handleReplyToMessage,
    handleCancelReply,
    handleOpenReactionPicker,
    handleToggleReaction,
  };
}
