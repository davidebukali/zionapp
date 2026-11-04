import { Conversation, OnlineContact } from "../../features/messages/types";

export interface MessagesHeaderProps {
  onPressCompose?: () => void;
}

export interface MessagesSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export interface ActiveContactsTrayProps {
  contacts: OnlineContact[];
  onSelectContact: (contact: OnlineContact) => void;
}

export interface ConversationListItemProps {
  conversation: Conversation;
  onPress: (conversation: Conversation) => void;
}

export interface MessagesEmptyStateProps {
  searchQuery?: string;
  onResetSearch?: () => void;
}

export interface NewMessageBottomSheetProps {
  visible: boolean;
  recipients: OnlineContact[];
  searchQuery: string;
  onChangeSearch: (text: string) => void;
  onClearSearch: () => void;
  onSelectRecipient: (contact: OnlineContact) => void;
  onClose: () => void;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  hasMore: boolean;
}


