import { Conversation, OnlineContact } from "./types";
import { formatRelativeTime } from "../../utils/date";

/**
 * Filters a list of conversations by participant name, username, or message text.
 */
export function filterConversations(
  conversations: Conversation[],
  searchQuery: string
): Conversation[] {
  const normalized = searchQuery.trim().toLowerCase();
  if (!normalized) {
    return conversations;
  }

  return conversations.filter((conv) => {
    const nameMatch = conv.participant.name.toLowerCase().includes(normalized);
    const usernameMatch = conv.participant.username
      .toLowerCase()
      .includes(normalized);
    const messageMatch = conv.lastMessage.text
      .toLowerCase()
      .includes(normalized);
    return nameMatch || usernameMatch || messageMatch;
  });
}

/**
 * Finds an existing conversation with an online contact or creates a new one at the top.
 */
export function findOrCreateConversation(
  conversations: Conversation[],
  contact: OnlineContact
): { updatedConversations: Conversation[]; selectedConversationId: string } {
  const existingIndex = conversations.findIndex(
    (c) => c.participant.id === contact.id
  );

  if (existingIndex !== -1) {
    return {
      updatedConversations: conversations,
      selectedConversationId: conversations[existingIndex].id,
    };
  }

  const newConversation: Conversation = {
    id: `conv-new-${contact.id}-${Date.now()}`,
    participant: contact,
    lastMessage: {
      text: "Start a conversation",
      type: "text",
      timestamp: "Just now",
    },
    unreadCount: 0,
  };

  return {
    updatedConversations: [newConversation, ...conversations],
    selectedConversationId: newConversation.id,
  };
}

/**
 * Formats a message timestamp into compact relative time (e.g. "2m", "1h", "1d").
 */
export function formatMessageTimestamp(timestamp: string): string {
  if (!timestamp) return "";

  // If already compact like "2m", "1h", "1d", return as-is
  if (/^(\d+[smhdw]|Just now)$/i.test(timestamp.trim())) {
    return timestamp;
  }

  const relative = formatRelativeTime(timestamp);
  // Strip " ago" suffix if present for compact header display
  return relative.replace(/\s+ago$/i, "");
}

