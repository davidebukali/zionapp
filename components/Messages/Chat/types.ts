import { ChatMessage, OnlineContact } from "../../../features/messages/types";

export interface ChatHeaderProps {
  participant: OnlineContact;
  onPressBack: () => void;
}

export interface ChatDateSeparatorProps {
  label: string;
}

export interface ChatReactionBadgeProps {
  reactions: string[];
}

export interface ChatReadReceiptProps {
  text: string;
}

export interface ChatTextBubbleProps {
  text: string;
  isOutgoing: boolean;
}

export interface ChatMediaBubbleProps {
  mediaUrl: string;
}

export interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export interface ChatTypingIndicatorProps {
  participant: OnlineContact;
  visible?: boolean;
}

export interface ChatComposerProps {
  text: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onToggleEmoji: () => void;
  placeholder?: string;
}

export interface ChatMessageListProps {
  messages: ChatMessage[];
  participant: OnlineContact;
  isTyping?: boolean;
  dateLabel?: string;
}

