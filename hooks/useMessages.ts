import { useState, useMemo, useCallback } from "react";
import {
  Conversation,
  OnlineContact,
} from "../features/messages/types";
import {
  MOCK_ACTIVE_CONTACTS,
  MOCK_CONVERSATIONS,
} from "../features/messages/mockData";
import {
  filterConversations,
  findOrCreateConversation,
} from "../features/messages/utils";

export function useMessages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] =
    useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeContacts] = useState<OnlineContact[]>(MOCK_ACTIVE_CONTACTS);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredConversations = useMemo(
    () => filterConversations(conversations, searchQuery),
    [conversations, searchQuery]
  );

  const handleSelectContact = useCallback((contact: OnlineContact): string => {
    let targetId = "";
    setConversations((prev) => {
      const { updatedConversations, selectedConversationId: id } =
        findOrCreateConversation(prev, contact);
      targetId = id;
      setSelectedConversationId(id);
      return updatedConversations;
    });
    return targetId;
  }, []);

  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversationId(conversation.id);
    // Optimistically mark as read
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversation.id ? { ...c, unreadCount: 0 } : c
      )
    );
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate lightweight refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  }, []);

  const onLoadMore = useCallback(() => {
    // Stub ready for cursor-based pagination when API is integrated
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    handleClearSearch,
    conversations: filteredConversations,
    totalConversationsCount: conversations.length,
    activeContacts,
    selectedConversationId,
    handleSelectContact,
    handleSelectConversation,
    isRefreshing,
    onRefresh,
    onLoadMore,
    isLoadingMore: false,
    hasMore: false,
  };
}

