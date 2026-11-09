import {
  ActorItem,
  NotificationFilterTab,
  NotificationItem,
  NotificationSection,
  NotificationType,
} from '../../features/notifications/types';

export interface NotificationHeaderProps {
  onBack: () => void;
  title?: string;
}

export interface NotificationTabsProps {
  activeTab: NotificationFilterTab;
  onSelectTab: (tab: NotificationFilterTab) => void;
}

export interface NotificationSectionHeaderProps {
  title: string;
  showMarkAllRead?: boolean;
  onMarkAllRead?: () => void;
  isMarkingAllRead?: boolean;
}

export interface NotificationAvatarBadgeProps {
  actor: ActorItem | null;
  type: NotificationType;
  onPress?: () => void;
  size?: number;
}

export interface NotificationActionButtonProps {
  isFollowing?: boolean;
  onPress: () => void;
  isLoading?: boolean;
}

export interface NotificationItemProps {
  notification: NotificationItem;
  onPress: (notification: NotificationItem) => void;
  onPressActor?: (notification: NotificationItem) => void;
  onToggleFollowBack?: (notification: NotificationItem) => void;
  isFollowLoading?: boolean;
}

export interface NotificationsListProps {
  sections: NotificationSection[];
  activeTab: NotificationFilterTab;
  hasUnreadNotifications: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  isMarkingAllRead: boolean;
  error?: unknown;
  onRefresh: () => void;
  onLoadMore: () => void;
  onMarkAllRead: () => void;
  onPressNotification: (notification: NotificationItem) => void;
  onPressActor?: (notification: NotificationItem) => void;
  onToggleFollowBack?: (notification: NotificationItem) => void;
}

