import { ChatMessage, OnlineContact, ReportReason } from "../../../features/messages/types";
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
  reactions: string[];
}

export interface ChatReadReceiptProps {
  text: string;
}

export interface ChatTextBubbleProps {
  text: string;
  isOutgoing: boolean;
  isDeleted?: boolean;
  isEdited?: boolean;
}

export interface ChatMediaBubbleProps {
  mediaUrl?: string;
  mediaUrls?: string[];
  onPressMedia?: (urls: string[], initialIndex: number) => void;
}

export interface ChatMessageBubbleProps {
  message: ChatMessage;
  onPressMedia?: (urls: string[], initialIndex: number) => void;
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
}

export interface ChatThreadOptionsSheetProps {
  visible: boolean;
  participant: OnlineContact;
  isMuted: boolean;
  isArchived: boolean;
  isBlocked: boolean;
  onClose: () => void;
  onToggleMute: () => void;
  onToggleArchive: () => void;
  onClearHistory: () => void;
  onReport: (reason: ReportReason) => void;
  onToggleBlock: () => void;
}

