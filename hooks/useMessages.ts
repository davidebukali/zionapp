import { useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Conversation, OnlineContact } from "../features/messages/types";
import {
  MOCK_ACTIVE_CONTACTS,
  MOCK_CONVERSATIONS,
} from "../features/messages/mockData";
import { filterConversations } from "../features/messages/utils";
import {
  useGetConversationsQuery,
  useGetMessageableRecipientsQuery,
} from "../features/messages/api";

export function useMessages() {
  const token = useSelector((state: RootState) => state.auth?.token);
  const [searchQuery, setSearchQuery] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);

  // 1. RTK Query for Conversations
  const {
    data: conversationsData,
    isLoading,
    isFetching,
    refetch: refetchConversations,
  } = useGetConversationsQuery(
    {
      q: searchQuery.trim() || undefined,
      cursor,
    },
    { skip: !token }
  );

  // 2. RTK Query for Messageable Recipients (mutual followers)
  const { data: recipientsData, refetch: refetchRecipients } =
    useGetMessageableRecipientsQuery(undefined, { skip: !token });

  const rawConversations: Conversation[] = useMemo(() => {
    if (conversationsData?.conversations && conversationsData.conversations.length > 0) {
      return conversationsData.conversations;
    }
    return MOCK_CONVERSATIONS;
  }, [conversationsData?.conversations]);

  const activeContacts: OnlineContact[] = useMemo(() => {
    if (recipientsData?.recipients && recipientsData.recipients.length > 0) {
      return recipientsData.recipients;
    }
    return MOCK_ACTIVE_CONTACTS;
  }, [recipientsData?.recipients]);

  const filteredConversations = useMemo(
    () => filterConversations(rawConversations, searchQuery),
    [rawConversations, searchQuery]
  );

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Navigating by target user_id
  const handleSelectContact = useCallback((contact: OnlineContact): string => {
    return contact.id;
  }, []);

  const handleSelectConversation = useCallback((conversation: Conversation): string => {
    setSelectedConversationId(conversation.id);
    return conversation.participant.id;
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setCursor(null);
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

  return {
    searchQuery,
    setSearchQuery,
    handleClearSearch,
    conversations: filteredConversations,
    totalConversationsCount: filteredConversations.length,
    activeContacts,
    selectedConversationId,
    handleSelectContact,
    handleSelectConversation,
    isRefreshing,
    onRefresh,
    onLoadMore,
    isLoadingMore: isFetching && !isLoading,
    hasMore: Boolean(conversationsData?.nextCursor),
  };
}
