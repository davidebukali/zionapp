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

  // Thread options & states
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(Boolean(cachedConversation?.isMuted));
  const [isArchived, setIsArchived] = useState(Boolean(cachedConversation?.isArchived));
  const [isBlocked, setIsBlocked] = useState(Boolean(cachedConversation?.hasBlockedParticipant));

  // Attached media states (Max 4 images, no captions)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState<string | null>(null);

  // Additional Mutations
  const [muteMutation] = useMuteConversationMutation();
  const [unmuteMutation] = useUnmuteConversationMutation();
  const [archiveMutation] = useArchiveConversationMutation();
  const [unarchiveMutation] = useUnarchiveConversationMutation();
  const [deleteConversationMutation] = useDeleteConversationMutation();
  const [reportConversationMutation] = useReportConversationMutation();
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
  };
}
