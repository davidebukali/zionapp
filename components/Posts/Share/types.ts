import { Post } from "../../../features/posts/types";
import { OnlineContact } from "../../../features/messages/types";

export interface SharePostBottomSheetProps {
  visible: boolean;
  post: Post | null;
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

