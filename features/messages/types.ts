// Pure TypeScript Declarations for Messages Feature (Tsiyon API Contract)

export type MessagePreviewType = "text" | "outgoing" | "reaction" | "photo";

export interface BackendAvatar {
  id: string;
  url: string;
}

export interface BackendRecipient {
  id: string; // ULID
  name: string;
  username: string;
  avatar?: BackendAvatar | null;
}

export interface BackendLastMessage {
  id: string;
  sender_id: string;
  body: string | null;
  is_deleted_for_everyone?: boolean;
  created_at: string; // ISO 8601
}

export interface BackendConversation {
  id: string; // ULID
  created_by?: string;
  last_message_at?: string | null;
  unread_count: number;
  is_archived: boolean;
  is_muted: boolean;
  can_send_messages?: boolean;
  has_blocked_participant?: boolean;
  recipient: BackendRecipient;
  last_message?: BackendLastMessage | null;
  created_at?: string;
  updated_at?: string;
}

export interface BackendMessageMedia {
  id: string;
  url: string;
  type: "image" | string;
  mime_type: string;
  size: number;
  width?: number | null;
  height?: number | null;
}

export interface BackendMessageReaction {
  emoji: string;
  count: number;
  user_reacted: boolean;
}

export interface BackendMessageReply {
  id: string;
  sender: {
    id: string;
    name: string;
  };
  body: string | null;
  mediaUrl?: string;
  is_deleted_for_everyone: boolean;
}

export interface BackendMessage {
  id: string; // ULID
  conversation_id: string;
  sender_id: string;
  sender: {
    id: string;
    name: string;
    username: string;
    avatar?: BackendAvatar | null;
  };
  body: string | null;
  media?: BackendMessageMedia[];
  reply_to?: BackendMessageReply | null;
  reactions?: BackendMessageReaction[];
  is_edited: boolean;
  edited_at?: string | null;
  is_deleted_for_everyone: boolean;
  deleted_for_everyone_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CursorPaginationMeta {
  prev_cursor?: string | null;
  next_cursor?: string | null;
  per_page?: number;
}

// REST Envelopes & Query Params
export interface GetConversationsParams {
  per_page?: number;
  cursor?: string | null;
  q?: string;
  archived?: boolean;
  currentUserId?: string;
}

export interface ConversationsListResponse {
  success: boolean;
  message: string;
  data: BackendConversation[];
  meta?: CursorPaginationMeta | null;
}

export interface ConversationsResult {
  conversations: Conversation[];
  nextCursor: string | null;
}

export interface GetRecipientsParams {
  per_page?: number;
  cursor?: string | null;
  q?: string;
}

export interface RecipientsListResponse {
  success: boolean;
  message: string;
  data: BackendRecipient[];
  meta?: CursorPaginationMeta | null;
}

export interface RecipientsResult {
  recipients: OnlineContact[];
  nextCursor: string | null;
}

export interface StartConversationRequest {
  recipient_id: string;
}

export interface ConversationResponse {
  success: boolean;
  message: string;
  data: BackendConversation;
  meta?: null;
}

export interface GetMessagesParams {
  conversationId: string;
  per_page?: number;
  cursor?: string | null;
  currentUserId?: string;
}

export interface MessagesListResponse {
  success: boolean;
  message: string;
  data: BackendMessage[];
  meta?: CursorPaginationMeta | null;
}

export interface MessagesResult {
  messages: ChatMessage[];
  nextCursor: string | null;
}

export interface SendMessageRequest {
  conversationId: string;
  body?: string;
  media_ids?: string[];
  reply_to_message_id?: string | null;
  optimisticMediaUrls?: string[];
  optimisticReplyTo?: BackendMessageReply | null;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: BackendMessage;
  meta?: null;
}

export interface EditMessageRequest {
  messageId: string;
  conversationId: string;
  body: string;
}

export interface EditMessageResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    body: string;
    is_edited: boolean;
    edited_at: string;
  };
  meta?: null;
}

export interface DeleteMessageResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    body: null;
    media: [];
    is_deleted_for_everyone: true;
    deleted_for_everyone_at: string;
  };
  meta?: null;
}

export interface ReactMessageRequest {
  messageId: string;
  conversationId: string;
  emoji: string;
}

export interface ReactionResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    message_id: string;
    user_id: string;
    emoji: string;
    created_at: string;
  } | null;
  meta?: null;
}

export type ReportReason =
  | "spam"
  | "harassment"
  | "hate_speech"
  | "inappropriate_content"
  | "violence"
  | "other";

export interface ReportRequest {
  id: string;
  reason: ReportReason | string;
  description?: string;
}

// WebSocket Event Types (Laravel Reverb)
export interface PresenceMember {
  id: string;
  name: string;
  username: string;
}

export interface MessageSentEvent extends BackendMessage {}

export interface MessageUpdatedEvent extends BackendMessage {
  is_edited: true;
  edited_at: string;
}

export interface MessageDeletedEvent {
  id: string;
  conversation_id: string;
  is_deleted_for_everyone: true;
  deleted_for_everyone_at: string;
}

export interface MessageReactionUpdatedEvent {
  message_id: string;
  conversation_id?: string;
  user_id?: string;
  emoji: string | null;
  reaction?: {
    id: string;
    message_id: string;
    user_id: string;
    emoji: string;
  } | null;
  reactions?: BackendMessageReaction[];
}

export interface MessageReadEvent {
  conversation_id: string;
  reader_id: string;
  last_read_message_id: string | null;
  read_at: string;
}

export interface TypingStartedEvent {
  conversation_id: string;
  user?: PresenceMember;
  user_id?: string;
  user_name?: string;
}

// UI Domain Models
export interface OnlineContact {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  initials: string;
  isOnline: boolean;
  avatarColor?: string;
}

export interface LastMessage {
  text: string;
  type: MessagePreviewType;
  timestamp: string; // ISO string or relative time label
  reactionEmoji?: string;
}

export interface Conversation {
  id: string;
  participant: OnlineContact;
  lastMessage: LastMessage;
  unreadCount: number;
  isArchived?: boolean;
  isMuted?: boolean;
  canSendMessages?: boolean;
  hasBlockedParticipant?: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  senderId: string;
  isOutgoing: boolean;
  text?: string;
  sharedPostId?: string;
  mediaUrl?: string;
  media?: BackendMessageMedia[];
  replyTo?: BackendMessageReply | null;
  timestamp: string;
  reactions?: string[];
  rawReactions?: BackendMessageReaction[];
  readReceipt?: string;
  isEdited?: boolean;
  isDeletedForEveryone?: boolean;
  createdAt?: string;
}

export interface PresenceState {
  onlineUserIds: string[];
}
