export type MessagePreviewType = "text" | "outgoing" | "reaction" | "photo";

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
}

export interface ChatMessage {
  id: string;
  senderId: string;
  isOutgoing: boolean;
  text?: string;
  mediaUrl?: string;
  timestamp: string;
  reactions?: string[];
  readReceipt?: string;
}

