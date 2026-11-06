import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useSelector } from "react-redux";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { RootState } from "../store/store";
import { Post } from "../features/posts/types";
import { OnlineContact } from "../features/messages/types";
import { filterRecipients } from "../features/messages/utils";
import {
  useGetMessageableRecipientsQuery,
  useSendMessageMutation,
  useStartOrGetConversationMutation,
} from "../features/messages/api";

export function useSharePostViaDM() {
  const token = useSelector((state: RootState) => state.auth.token);
  const [shareTarget, setShareTarget] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const [startOrGetConversation] = useStartOrGetConversationMutation();
  const [sendMessage] = useSendMessageMutation();

  const {
    data: recipientsData,
    isLoading: isLoadingRecipients,
    isFetching: isFetchingRecipients,
  } = useGetMessageableRecipientsQuery(
    { cursor, q: searchQuery },
    { skip: !token || !shareTarget }
  );

  const activeContacts = useMemo(
    () => recipientsData?.recipients ?? [],
    [recipientsData?.recipients]
  );

  const filteredRecipients = useMemo(
    () => filterRecipients(activeContacts, searchQuery),
    [activeContacts, searchQuery]
  );

  const openShareDM = useCallback((post: Post) => {
    // Delay slightly so the menu modal finishes its dismissal animation on iOS
    setTimeout(() => {
      setShareTarget(post);
      setSearchQuery("");
      setCursor(null);
    }, 100);
  }, []);

  const closeShareDM = useCallback(() => {
    setShareTarget(null);
    setSearchQuery("");
    setCursor(null);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const onLoadMore = useCallback(() => {
    if (recipientsData?.nextCursor && !isFetchingRecipients) {
      setCursor(recipientsData.nextCursor);
    }
  }, [recipientsData?.nextCursor, isFetchingRecipients]);

  const handleSelectRecipient = useCallback(
    async (contact: OnlineContact) => {
      if (!shareTarget || isSending) return;
      const targetPost = shareTarget;
      setIsSending(true);

      try {
        const conversation = await startOrGetConversation({
          recipient_id: contact.id,
        }).unwrap();

        await sendMessage({
          conversationId: conversation.id,
          body: `[zion:post:${targetPost.id}]`,
        }).unwrap();

        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});

        closeShareDM();

        setTimeout(() => {
          Alert.alert("Post Shared", `Sent to ${contact.name}`, [
            { text: "Dismiss", style: "cancel" },
            {
              text: "View Chat",
              onPress: () => {
                router.push(`/messages/${contact.id}` as any);
              },
            },
          ]);
        }, 120);
      } catch {
        Alert.alert("Error", "Failed to share post. Please try again.");
      } finally {
        setIsSending(false);
      }
    },
    [shareTarget, isSending, startOrGetConversation, sendMessage, closeShareDM]
  );

  return {
    shareTarget,
    isOpen: Boolean(shareTarget),
    recipients: filteredRecipients,
    searchQuery,
    setSearchQuery,
    handleClearSearch,
    openShareDM,
    closeShareDM,
    handleSelectRecipient,
    onLoadMore,
    isLoadingMore: isFetchingRecipients && !isLoadingRecipients,
    hasMore: Boolean(recipientsData?.nextCursor),
    isSending,
  };
}

