import React from "react";
import { FlatList } from "react-native";
import { Post } from "../../../features/posts/types";
import { User } from "../../../features/auth/types";

export interface FeedPostActions {
  onLike: (post: Post) => void;
  onComment: (postId: string) => void;
  onRepost: (post: Post) => void;
  onBookmark: (post: Post) => void;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
  onFollowToggle?: (post: Post) => void;
  onReport?: (post: Post) => void;
}

export interface FeedPostItemProps {
  post: Post;
  currentUser?: User | null;
  actions: FeedPostActions;
}

export interface HomeFeedContentProps {
  posts: Post[];
  isInitialLoading: boolean;
  hasError: boolean;
  error?: unknown;
  hasMore: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  handleRefresh: () => void;
  handleLoadMore: () => void;
  onPullToRefresh?: () => void;
  renderPostItem: (info: { item: Post }) => React.ReactElement | null;
  listRef?: React.Ref<FlatList<Post>>;
  newPostsCount?: number;
  onPressNewPosts?: () => void;
}

export interface NewPostsPillProps {
  count: number;
  onPress: () => void;
}
