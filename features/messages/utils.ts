import {
  BackendConversation,
  BackendMessage,
  BackendMessageReaction,
  BackendMessageReactionsSummary,
  BackendRecipient,
  ChatMessage,
  Conversation,
  ConversationsResult,
  LastMessage,
  MessagePreviewType,
  MessageReactionUpdatedEvent,
  MessagesResult,
  OnlineContact,
  RecipientsResult,
} from "./types";
import { TEMP_MESSAGE_ID_PREFIX } from "./constants";
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
  const displayName = raw.name?.trim() || raw.username?.trim() || "";

  return {
    id: String(raw.id),
    name: displayName,
    username: raw.username || "",
    avatarUrl: raw.avatar?.url || undefined,
    initials: getInitials(displayName),
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
      previewText = formatConversationPreviewText(raw.last_message.body);
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

export const POST_SHARE_PREVIEW_TEXT = "shared a post";

export const ZION_POST_TAG_REGEX = /\[?zion:post:([a-zA-Z0-9_-]+)\]?/;

/**
 * Normalizes raw message body text into conversation preview text.
 * Renders post share messages cleanly as "shared a post".
 */
export function formatConversationPreviewText(body: string): string {
  if (ZION_POST_TAG_REGEX.test(body)) {
    return POST_SHARE_PREVIEW_TEXT;
  }
  return body;
}

/**
 * Normalizes raw reaction items into an aggregated BackendMessageReaction list.
 * Supports:
 * 1. Backend summary contract: { summary: Record<string, number>, viewer_reaction: string | null, total_count: number }
 * 2. Pre-aggregated backend reaction objects: [{ emoji, count, user_reacted }]
 * 3. Individual reaction models: [{ id, user_id, emoji }]
 */
export function normalizeReactions(
  rawReactions?:
    | Array<any>
    | BackendMessageReactionsSummary
    | Record<string, number>
    | null,
  currentUserId?: string
): BackendMessageReaction[] {
  if (!rawReactions) {
    return [];
  }

  // 1. Backend summary contract: { summary: { "❤️": 1 }, viewer_reaction: "❤️", total_count: 1 }
  if (typeof rawReactions === "object" && !Array.isArray(rawReactions)) {
    const reactionsSummaryObject = rawReactions as any;
    const summaryDictionary: Record<string, number> =
      reactionsSummaryObject.summary &&
      typeof reactionsSummaryObject.summary === "object"
        ? reactionsSummaryObject.summary
        : reactionsSummaryObject;

    const viewerReactionEmoji: string | null =
      reactionsSummaryObject.viewer_reaction ?? null;

    const summaryEntries = Object.entries(summaryDictionary);
    if (summaryEntries.length === 0) {
      return [];
    }

    return summaryEntries
      .filter(([emoji, count]) => Boolean(emoji) && Number(count) > 0)
      .map(([emoji, count]) => ({
        emoji,
        count: Number(count),
        user_reacted: viewerReactionEmoji === emoji,
      }));
  }

  if (!Array.isArray(rawReactions) || rawReactions.length === 0) {
    return [];
  }

  // 2. Pre-aggregated backend reaction objects with count
  if (typeof rawReactions[0]?.count === "number") {
    return rawReactions.map((reactionItem) => ({
      emoji: String(reactionItem.emoji),
      count: Number(reactionItem.count),
      user_reacted: Boolean(reactionItem.user_reacted),
    }));
  }

  // 3. Array of individual reaction records from backend
  const reactionsMap = new Map<string, { count: number; userReacted: boolean }>();

  rawReactions.forEach((reactionItem) => {
    if (!reactionItem?.emoji) return;
    const existingEntry = reactionsMap.get(reactionItem.emoji) || {
      count: 0,
      userReacted: false,
    };
    const isCurrentUserReaction =
      Boolean(currentUserId) &&
      String(reactionItem.user_id) === String(currentUserId);

    reactionsMap.set(reactionItem.emoji, {
      count: existingEntry.count + 1,
      userReacted:
        existingEntry.userReacted ||
        isCurrentUserReaction ||
        Boolean(reactionItem.user_reacted),
    });
  });

  return Array.from(reactionsMap.entries()).map(([emoji, reactionData]) => ({
    emoji,
    count: reactionData.count,
    user_reacted: reactionData.userReacted,
  }));
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
  const rawBody = raw.body ?? undefined;
  let sharedPostId: string | undefined;
  let cleanedText = rawBody;

  if (!isDeleted && rawBody) {
    const match = rawBody.match(ZION_POST_TAG_REGEX);
    if (match) {
      sharedPostId = match[1];
      const stripped = rawBody.replace(ZION_POST_TAG_REGEX, "").trim();
      cleanedText = stripped.length > 0 ? stripped : undefined;
    }
  }

  const text = isDeleted
    ? "This message was deleted"
    : cleanedText;

  const mediaUrl =
    !isDeleted && raw.media && raw.media.length > 0
      ? raw.media[0].url
      : undefined;

  const normalizedRawReactions = normalizeReactions(raw.reactions, currentUserId);
  const reactions =
    normalizedRawReactions.length > 0
      ? normalizedRawReactions.map((reactionItem) => reactionItem.emoji)
      : undefined;

  return {
    id: String(raw.id),
    conversationId: String(raw.conversation_id),
    senderId: String(raw.sender_id),
    isOutgoing,
    text,
    sharedPostId,
    mediaUrl,
    media: isDeleted ? [] : raw.media,
    replyTo: raw.reply_to || null,
    timestamp: formatMessageTimestamp(raw.created_at),
    reactions,
    rawReactions: normalizedRawReactions,
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
 * Filters a list of messageable recipients by name or @username.
 */
export function filterRecipients(
  recipients: OnlineContact[],
  searchQuery: string
): OnlineContact[] {
  const normalized = searchQuery.trim().toLowerCase().replace(/^@/, "");
  if (!normalized) {
    return recipients;
  }

  return recipients.filter((contact) => {
    const nameMatch = contact.name.toLowerCase().includes(normalized);
    const usernameMatch = contact.username.toLowerCase().includes(normalized);
    return nameMatch || usernameMatch;
  });
}

/**
 * Merges paginated messageable recipients cache.
 */
export function mergeRecipientsCache(
  currentCache: RecipientsResult,
  newItems: RecipientsResult,
  cursor?: string | null
): void {
  if (!cursor) {
    currentCache.recipients = newItems.recipients;
    currentCache.nextCursor = newItems.nextCursor;
    return;
  }

  const existingIds = new Set(currentCache.recipients.map((r) => r.id));
  const uniqueIncoming = newItems.recipients.filter(
    (r) => !existingIds.has(r.id)
  );
  currentCache.recipients.push(...uniqueIncoming);
  currentCache.nextCursor = newItems.nextCursor;
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
  // Reverse-chronological order (newest first for inverted FlatList): older messages appended
  currentCache.messages = [...currentCache.messages, ...uniqueIncoming];
  currentCache.nextCursor = newItems.nextCursor;
}

/**
 * Pure helper to apply a reaction WebSocket event to a ChatMessage.
 * Confirmed event payload: { message_id, conversation_id, user_id, emoji: string | null }
 */
export function applyReactionEventToMessage(
  message: ChatMessage,
  event: MessageReactionUpdatedEvent,
  currentUserId?: string
): ChatMessage {
  if (event.reactions && Array.isArray(event.reactions)) {
    const normalizedRawReactions = normalizeReactions(event.reactions, currentUserId);
    const reactionEmojis = normalizedRawReactions.map((reactionItem) => reactionItem.emoji);
    return {
      ...message,
      rawReactions: normalizedRawReactions,
      reactions: reactionEmojis.length > 0 ? reactionEmojis : undefined,
    };
  }

  const existingRawReactions = message.rawReactions || [];
  const eventUserId = event.user_id ?? event.reaction?.user_id;
  const isCurrentUser =
    Boolean(currentUserId) && String(eventUserId) === String(currentUserId);

  const eventEmoji = event.emoji ?? event.reaction?.emoji ?? null;

  let updatedRawReactions: BackendMessageReaction[] = [];

  if (isCurrentUser) {
    // Current user added, removed, or changed their reaction
    // First, remove the current user's reaction from whatever emoji they had reacted to
    updatedRawReactions = existingRawReactions
      .map((reactionItem) => {
        if (!reactionItem.user_reacted) {
          return reactionItem;
        }
        return {
          ...reactionItem,
          count: reactionItem.count - 1,
          user_reacted: false,
        };
      })
      .filter((reactionItem) => reactionItem.count > 0);

    // If an emoji was selected (not removed), increment or append it
    if (eventEmoji) {
      const existingEmojiIndex = updatedRawReactions.findIndex(
        (reactionItem) => reactionItem.emoji === eventEmoji
      );
      if (existingEmojiIndex !== -1) {
        updatedRawReactions[existingEmojiIndex] = {
          ...updatedRawReactions[existingEmojiIndex],
          count: updatedRawReactions[existingEmojiIndex].count + 1,
          user_reacted: true,
        };
      } else {
        updatedRawReactions.push({
          emoji: eventEmoji,
          count: 1,
          user_reacted: true,
        });
      }
    }
  } else {
    // Another participant reacted or removed their reaction
    updatedRawReactions = [...existingRawReactions];
    if (eventEmoji) {
      const existingEmojiIndex = updatedRawReactions.findIndex(
        (reactionItem) => reactionItem.emoji === eventEmoji
      );
      if (existingEmojiIndex !== -1) {
        updatedRawReactions[existingEmojiIndex] = {
          ...updatedRawReactions[existingEmojiIndex],
          count: updatedRawReactions[existingEmojiIndex].count + 1,
        };
      } else {
        updatedRawReactions.push({
          emoji: eventEmoji,
          count: 1,
          user_reacted: false,
        });
      }
    } else {
      // Another user removed their reaction: decrement a reaction not authored by current user
      const candidateIndex = updatedRawReactions.findIndex(
        (reactionItem) => !reactionItem.user_reacted || reactionItem.count > 1
      );
      if (candidateIndex !== -1) {
        const targetReaction = updatedRawReactions[candidateIndex];
        if (targetReaction.count > 1) {
          updatedRawReactions[candidateIndex] = {
            ...targetReaction,
            count: targetReaction.count - 1,
          };
        } else {
          updatedRawReactions.splice(candidateIndex, 1);
        }
      }
    }
  }

  const reactionEmojis = updatedRawReactions.map((reactionItem) => reactionItem.emoji);
  return {
    ...message,
    rawReactions: updatedRawReactions,
    reactions: reactionEmojis.length > 0 ? reactionEmojis : undefined,
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
  let conversationFound = false;
  let alreadyExists = false;

  const patchMessages = dispatch(
    api.util.updateQueryData(
      "getMessages",
      { conversationId },
      (draft: MessagesResult) => {
        if (!draft || !draft.messages) return;
        const existsIndex = draft.messages.findIndex((m) => m.id === message.id);
        if (existsIndex !== -1) {
          alreadyExists = true;
          return;
        }

        // If message is outgoing and not a temp id, check if there's a pending optimistic message to replace
        if (message.isOutgoing && !message.id.startsWith("temp-")) {
          const optimisticIndex = draft.messages.findIndex(
            (m) => m.isOutgoing && m.id.startsWith("temp-")
          );
          if (optimisticIndex !== -1) {
            draft.messages[optimisticIndex] = message;
            return;
          }
        }

        draft.messages.unshift(message);
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
          conversationFound = true;
          const conv = draft.conversations[convIndex];
          const previewText = message.sharedPostId
            ? POST_SHARE_PREVIEW_TEXT
            : message.text
              ? formatConversationPreviewText(message.text)
              : message.mediaUrl
                ? "Photo"
                : "";

          conv.lastMessage = {
            text: previewText,
            type: message.isOutgoing ? "outgoing" : "text",
            timestamp: message.timestamp || "Just now",
          };
          if (!message.isOutgoing && !alreadyExists) {
            conv.unreadCount += 1;
          }
          // Move conversation to top
          draft.conversations.splice(convIndex, 1);
          draft.conversations.unshift(conv);
        }
      }
    )
  );

  // If this is a brand new conversation not yet in the inbox list,
  // invalidate to fetch the new conversation card with participant details
  if (!conversationFound && typeof api?.util?.invalidateTags === "function") {
    dispatch(
      api.util.invalidateTags([{ type: "Conversation", id: "LIST" }])
    );
  }

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

/**
 * Determines whether a message is an optimistic/pending outgoing message that hasn't synced with the server yet.
 */
export function isPendingMessage(message: ChatMessage): boolean {
  return (
    typeof message.id === "string" &&
    message.id.startsWith(TEMP_MESSAGE_ID_PREFIX)
  );
}

/**
 * Determines whether a message can be copied to the clipboard (must have text and not be deleted).
 */
export function canCopyMessage(message: ChatMessage): boolean {
  return !message.isDeletedForEveryone && Boolean(message.text?.trim());
}

/**
 * Determines whether a message can be reported (must be incoming, not pending, and not deleted).
 */
export function canReportMessage(message: ChatMessage): boolean {
  return (
    !message.isOutgoing &&
    !message.isDeletedForEveryone &&
    !isPendingMessage(message)
  );
}


