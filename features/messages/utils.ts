import {
  BackendConversation,
  BackendMessage,
  BackendRecipient,
  ChatMessage,
  Conversation,
  ConversationsResult,
  LastMessage,
  MessagePreviewType,
  MessageReactionUpdatedEvent,
  MessagesResult,
  OnlineContact,
} from "./types";
import { formatRelativeTime } from "../../utils/date";

const AVATAR_COLORS = [
  "#7CB342",
  "#E64A19",
  "#8BC34A",
  "#9E9D24",
  "#F4511E",
  "#278CCB",
  "#B277E8",
  "#D75E98",
];

export function getAvatarColor(seed: string): string {
  if (!seed) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function getInitials(name?: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

/**
 * Normalizes a backend recipient into the UI OnlineContact model.
 */
export function normalizeRecipient(raw: BackendRecipient): OnlineContact {
  return {
    id: String(raw.id),
    name: raw.name || "Unknown",
    username: raw.username || "",
    avatarUrl: raw.avatar?.url || undefined,
    initials: getInitials(raw.name),
    isOnline: false,
    avatarColor: getAvatarColor(String(raw.id)),
  };
}

/**
 * Formats a message timestamp into compact relative time (e.g. "2m", "1h", "1d").
 */
export function formatMessageTimestamp(timestamp?: string | null): string {
  if (!timestamp) return "";

  const trimmed = timestamp.trim();
  if (/^(\d+[smhdw]|Just now)$/i.test(trimmed)) {
    return trimmed;
  }

  // If already formatted like HH:MM
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const relative = formatRelativeTime(timestamp);
    return relative.replace(/\s+ago$/i, "");
  } catch {
    return "";
  }
}

/**
 * Normalizes a backend conversation record into the UI Conversation model.
 */
export function normalizeConversation(
  raw: BackendConversation,
  currentUserId?: string
): Conversation {
  const participant = normalizeRecipient(raw.recipient);

  let previewText = "No messages yet";
  let previewType: MessagePreviewType = "text";
  let timestamp = formatMessageTimestamp(raw.last_message_at || raw.updated_at);

  if (raw.last_message) {
    const isOutgoing =
      Boolean(currentUserId) &&
      String(raw.last_message.sender_id) === String(currentUserId);

    if (raw.last_message.is_deleted_for_everyone) {
      previewText = "This message was deleted";
      previewType = "text";
    } else if (raw.last_message.body) {
      previewText = raw.last_message.body;
      previewType = isOutgoing ? "outgoing" : "text";
    } else {
      previewText = "Attachment";
      previewType = "photo";
    }

    if (raw.last_message.created_at) {
      timestamp = formatMessageTimestamp(raw.last_message.created_at);
    }
  }

  const lastMessage: LastMessage = {
    text: previewText,
    type: previewType,
    timestamp,
  };

  return {
    id: String(raw.id),
    participant,
    lastMessage,
    unreadCount: raw.unread_count ?? 0,
    isArchived: Boolean(raw.is_archived),
    isMuted: Boolean(raw.is_muted),
    canSendMessages: raw.can_send_messages !== false,
    hasBlockedParticipant: Boolean(raw.has_blocked_participant),
  };
}

/**
 * Normalizes a backend message record into the UI ChatMessage model.
 */
export function normalizeMessage(
  raw: BackendMessage,
  currentUserId?: string
): ChatMessage {
  const isOutgoing =
    Boolean(currentUserId) &&
    String(raw.sender_id) === String(currentUserId);

  const isDeleted = Boolean(raw.is_deleted_for_everyone);
  const text = isDeleted
    ? "This message was deleted"
    : raw.body ?? undefined;

  const mediaUrl =
    !isDeleted && raw.media && raw.media.length > 0
      ? raw.media[0].url
      : undefined;

  const reactions =
    raw.reactions && raw.reactions.length > 0
      ? raw.reactions.map((r) => r.emoji)
      : undefined;

  return {
    id: String(raw.id),
    conversationId: String(raw.conversation_id),
    senderId: String(raw.sender_id),
    isOutgoing,
    text,
    mediaUrl,
    media: isDeleted ? [] : raw.media,
    replyTo: raw.reply_to || null,
    timestamp: formatMessageTimestamp(raw.created_at),
    reactions,
    rawReactions: raw.reactions,
    isEdited: Boolean(raw.is_edited),
    isDeletedForEveryone: isDeleted,
    createdAt: raw.created_at,
  };
}

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
 * Merges paginated conversations cache.
 */
export function mergeConversationsCache(
  currentCache: ConversationsResult,
  newItems: ConversationsResult,
  cursor?: string | null
): void {
  if (!cursor) {
    // Initial fetch or full refresh: replace
    currentCache.conversations = newItems.conversations;
    currentCache.nextCursor = newItems.nextCursor;
    return;
  }

  // Appending next page: deduplicate by id
  const existingIds = new Set(currentCache.conversations.map((c) => c.id));
  const uniqueIncoming = newItems.conversations.filter(
    (c) => !existingIds.has(c.id)
  );
  currentCache.conversations.push(...uniqueIncoming);
  currentCache.nextCursor = newItems.nextCursor;
}

/**
 * Merges paginated messages cache.
 */
export function mergeMessagesCache(
  currentCache: MessagesResult,
  newItems: MessagesResult,
  cursor?: string | null
): void {
  if (!cursor) {
    currentCache.messages = newItems.messages;
    currentCache.nextCursor = newItems.nextCursor;
    return;
  }

  const existingIds = new Set(currentCache.messages.map((m) => m.id));
  const uniqueIncoming = newItems.messages.filter(
    (m) => !existingIds.has(m.id)
  );
  // Chronological order: older messages prepended or appended based on cursor
  currentCache.messages = [...uniqueIncoming, ...currentCache.messages];
  currentCache.nextCursor = newItems.nextCursor;
}

/**
 * Pure helper to apply a reaction WebSocket event to a ChatMessage.
 */
export function applyReactionEventToMessage(
  msg: ChatMessage,
  event: MessageReactionUpdatedEvent,
  currentUserId?: string
): ChatMessage {
  const existingRaw = msg.rawReactions || [];
  const isMe =
    Boolean(currentUserId) && String(event.user_id) === String(currentUserId);

  let updatedRaw = existingRaw.filter(
    (r) => !(isMe && r.user_reacted)
  );

  if (event.emoji) {
    const existingIndex = updatedRaw.findIndex((r) => r.emoji === event.emoji);
    if (existingIndex !== -1) {
      updatedRaw[existingIndex] = {
        ...updatedRaw[existingIndex],
        count: updatedRaw[existingIndex].count + 1,
        user_reacted: isMe ? true : updatedRaw[existingIndex].user_reacted,
      };
    } else {
      updatedRaw.push({
        emoji: event.emoji,
        count: 1,
        user_reacted: isMe,
      });
    }
  }

  const reactions = updatedRaw.map((r) => r.emoji);
  return {
    ...msg,
    rawReactions: updatedRaw,
    reactions: reactions.length > 0 ? reactions : undefined,
  };
}

// ----------------------------------------------------------------------
// Dependency-Injected RTK Query Cache Updaters
// Note: api slice is passed as a parameter to prevent circular dependencies.
// ----------------------------------------------------------------------

/**
 * Inserts a new message into the RTK Query messages cache and updates conversation snippet.
 */
export function insertMessageInCache(
  api: any,
  dispatch: any,
  conversationId: string,
  message: ChatMessage
): () => void {
  const patchMessages = dispatch(
    api.util.updateQueryData(
      "getMessages",
      { conversationId },
      (draft: MessagesResult) => {
        if (!draft || !draft.messages) return;
        const exists = draft.messages.some((m) => m.id === message.id);
        if (!exists) {
          draft.messages.push(message);
        }
      }
    )
  );

  const patchConversations = dispatch(
    api.util.updateQueryData(
      "getConversations",
      undefined,
      (draft: ConversationsResult) => {
        if (!draft || !draft.conversations) return;
        const convIndex = draft.conversations.findIndex(
          (c) => c.id === conversationId
        );
        if (convIndex !== -1) {
          const conv = draft.conversations[convIndex];
          conv.lastMessage = {
            text: message.text || (message.mediaUrl ? "Photo" : ""),
            type: message.isOutgoing ? "outgoing" : "text",
            timestamp: message.timestamp || "Just now",
          };
          if (!message.isOutgoing) {
            conv.unreadCount += 1;
          }
          // Move conversation to top
          draft.conversations.splice(convIndex, 1);
          draft.conversations.unshift(conv);
        }
      }
    )
  );

  return () => {
    patchMessages.undo();
    patchConversations.undo();
  };
}

/**
 * Updates a specific message in the RTK Query messages cache.
 */
export function updateMessageInCache(
  api: any,
  dispatch: any,
  conversationId: string,
  messageId: string,
  updater: (msg: ChatMessage) => void
): () => void {
  const patch = dispatch(
    api.util.updateQueryData(
      "getMessages",
      { conversationId },
      (draft: MessagesResult) => {
        if (!draft || !draft.messages) return;
        const msg = draft.messages.find((m) => m.id === messageId);
        if (msg) {
          updater(msg);
        }
      }
    )
  );

  return () => {
    patch.undo();
  };
}

/**
 * Resets unreadCount to 0 for a conversation in the getConversations cache.
 */
export function markConversationReadInCache(
  api: any,
  dispatch: any,
  conversationId: string
): () => void {
  const patch = dispatch(
    api.util.updateQueryData(
      "getConversations",
      undefined,
      (draft: ConversationsResult) => {
        if (!draft || !draft.conversations) return;
        const conv = draft.conversations.find((c) => c.id === conversationId);
        if (conv) {
          conv.unreadCount = 0;
        }
      }
    )
  );

  return () => {
    patch.undo();
  };
}

/**
 * Updates a conversation in the getConversations cache.
 */
export function updateConversationInCache(
  api: any,
  dispatch: any,
  conversationId: string,
  updater: (conv: Conversation) => void
): () => void {
  const patch = dispatch(
    api.util.updateQueryData(
      "getConversations",
      undefined,
      (draft: ConversationsResult) => {
        if (!draft || !draft.conversations) return;
        const conv = draft.conversations.find((c) => c.id === conversationId);
        if (conv) {
          updater(conv);
        }
      }
    )
  );

  return () => {
    patch.undo();
  };
}
