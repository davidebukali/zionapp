import {
  BackendMessageReaction,
  ChatMessage,
  OnlineContact,
  ReportReason,
} from "../../../features/messages/types";
import { MediaItem } from "../../../utils/mediaUploader";

export interface ChatHeaderProps {
  participant: OnlineContact;
  onPressBack: () => void;
  isMuted?: boolean;
  onPressOptions?: () => void;
}

export interface ChatDateSeparatorProps {
  label: string;
}

export interface ChatReactionBadgeProps {
  reactions?: string[];
  rawReactions?: BackendMessageReaction[];
  onPressReaction?: (emoji: string) => void;
}

export interface ChatReadReceiptProps {
  text: string;
}

export interface ChatTextBubbleProps {
  text?: string | null;
  isOutgoing: boolean;
  isDeleted?: boolean;
  isEdited?: boolean;
  header?: React.ReactNode;
  children?: React.ReactNode;
}

export interface QuickReactionBarProps {
  onSelectEmoji: (emoji: string) => void;
  onPressMore: () => void;
}

export interface ChatMessageActionSheetProps {
  message: ChatMessage | null;
  onClose: () => void;
  onReact: (messageId: string, emoji: string) => void;
  onOpenReactionPicker: (messageId: string) => void;
  onCopy: (message: ChatMessage) => void;
  onReport: (message: ChatMessage, reason: ReportReason) => void;
  onDelete: (message: ChatMessage) => void;
}

export interface ChatSwipeReplyActionProps {
  isOutgoing?: boolean;
}

export interface ChatMediaBubbleProps {
  mediaUrl?: string;
  mediaUrls?: string[];
  onPressMedia?: (urls: string[], initialIndex: number) => void;
}

export interface ChatMessageBubbleProps {
  message: ChatMessage;
  participantName?: string;
  onPressMedia?: (urls: string[], initialIndex: number) => void;
  onReply?: (message: ChatMessage) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onLongPress?: (message: ChatMessage) => void;
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
  disabled?: boolean;
  selectedMedia?: MediaItem[];
  onPickMedia?: () => void;
  onRemoveMedia?: (index: number) => void;
  isUploadingMedia?: boolean;
  uploadStatusText?: string | null;
  replyingTo?: ChatMessage | null;
  participantName?: string;
  onCancelReply?: () => void;
}

export interface ChatMessageListProps {
  messages: ChatMessage[];
  participant: OnlineContact;
  isTyping?: boolean;
  dateLabel?: string;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onPressMedia?: (urls: string[], initialIndex: number) => void;
  onReply?: (message: ChatMessage) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onLongPress?: (message: ChatMessage) => void;
}

export interface ChatThreadOptionsSheetProps {
  visible: boolean;
  participant: OnlineContact;
  isMuted: boolean;
  isArchived: boolean;
  isBlocked: boolean;
  isDraft?: boolean;
  onClose: () => void;
  onToggleMute: () => void;
  onToggleArchive: () => void;
  onClearHistory: () => void;
  onReport: (reason: ReportReason) => void;
  onToggleBlock: () => void;
}

