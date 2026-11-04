import { useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Conversation, OnlineContact } from "../features/messages/types";
import {
  filterConversations,
  filterRecipients,
} from "../features/messages/utils";
import {
  useGetConversationsQuery,
  useGetMessageableRecipientsQuery,
} from "../features/messages/api";

export function useMessages() {
  const token = useSelector((state: RootState) => state.auth?.token);
  const currentUserId = useSelector((state: RootState) =>
    state.auth?.user?.id ? String(state.auth.user.id) : undefined
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compose ("New Message") bottom sheet state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [recipientSearchQuery, setRecipientSearchQuery] = useState("");
  const [recipientsCursor, setRecipientsCursor] = useState<string | null>(null);

  // 1. Fetch Conversations from API (stored in RTK Query cache)
  const {
    data: conversationsData,
    isLoading,
    isFetching,
    refetch: refetchConversations,
  } = useGetConversationsQuery(
    {
      cursor,
      currentUserId,
    },
    { skip: !token }
  );

  // 2. Fetch Messageable Recipients (followed accounts with accepted follow)
  const {
    data: recipientsData,
    isLoading: isLoadingRecipients,
    isFetching: isFetchingRecipients,
    refetch: refetchRecipients,
  } = useGetMessageableRecipientsQuery(
    { cursor: recipientsCursor },
    { skip: !token }
  );

  const rawConversations: Conversation[] = useMemo(
    () => conversationsData?.conversations ?? [],
    [conversationsData?.conversations]
  );

  const activeContacts: OnlineContact[] = useMemo(
    () => recipientsData?.recipients ?? [],
    [recipientsData?.recipients]
  );

  // 3. Perform instant inbox search on local cache
  const filteredConversations = useMemo(
    () => filterConversations(rawConversations, searchQuery),
    [rawConversations, searchQuery]
  );

  // 4. Perform instant recipient search on local cache
  const filteredRecipients = useMemo(
    () => filterRecipients(activeContacts, recipientSearchQuery),
    [activeContacts, recipientSearchQuery]
  );

  const handleOpenCompose = useCallback(() => {
    setRecipientSearchQuery("");
    setIsComposeOpen(true);
  }, []);

  const handleCloseCompose = useCallback(() => {
    setIsComposeOpen(false);
    setRecipientSearchQuery("");
  }, []);

  const handleClearRecipientSearch = useCallback(() => {
    setRecipientSearchQuery("");
  }, []);

  // Navigate by target user_id
  const handleSelectContact = useCallback((contact: OnlineContact): string => {
    return contact.id;
  }, []);

  const handleSelectConversation = useCallback(
    (conversation: Conversation): string => {
      return conversation.participant.id;
    },
    []
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setCursor(null);
    setRecipientsCursor(null);
    try {
      if (token) {
        await Promise.all([refetchConversations(), refetchRecipients()]);
      }
    } catch {
      // Ignore refresh error
    } finally {
      setIsRefreshing(false);
    }
  }, [token, refetchConversations, refetchRecipients]);

  const onLoadMore = useCallback(() => {
    if (conversationsData?.nextCursor && !isFetching) {
      setCursor(conversationsData.nextCursor);
    }
  }, [conversationsData?.nextCursor, isFetching]);

  const onLoadMoreRecipients = useCallback(() => {
    if (recipientsData?.nextCursor && !isFetchingRecipients) {
      setRecipientsCursor(recipientsData.nextCursor);
    }
  }, [recipientsData?.nextCursor, isFetchingRecipients]);

  return {
    searchQuery,
    setSearchQuery,
    handleClearSearch,
    conversations: filteredConversations,
    totalConversationsCount: filteredConversations.length,
    activeContacts,
    isComposeOpen,
    handleOpenCompose,
    handleCloseCompose,
    recipientSearchQuery,
    setRecipientSearchQuery,
    handleClearRecipientSearch,
    filteredRecipients,
    onLoadMoreRecipients,
    isLoadingMoreRecipients: isFetchingRecipients && !isLoadingRecipients,
    hasMoreRecipients: Boolean(recipientsData?.nextCursor),
    handleSelectContact,
    handleSelectConversation,
    isLoading,
    isRefreshing,
    onRefresh,
    onLoadMore,
    isLoadingMore: isFetching && !isLoading,
    hasMore: Boolean(conversationsData?.nextCursor),
  };
}
