import { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { router } from 'expo-router';

import type { AppDispatch } from '../store/store';
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
  notificationsApi,
} from '../features/notifications/api';
import {
  NotificationFilterTab,
  NotificationItem,
} from '../features/notifications/types';
import {
  filterNotificationsByTab,
  groupNotificationsByDate,
  resolveNotificationTarget,
  updateNotificationActorFollowInCaches,
} from '../features/notifications/utils';
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from '../features/users/api';

export function useNotifications() {
  const dispatch = useDispatch<AppDispatch>();

  const [activeTab, setActiveTab] = useState<NotificationFilterTab>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: notificationsResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetNotificationsQuery({
    page: currentPage,
    per_page: 20,
  });

  const [markNotificationAsReadTrigger] = useMarkNotificationAsReadMutation();
  const [markAllNotificationsAsReadTrigger, { isLoading: isMarkingAllRead }] =
    useMarkAllNotificationsAsReadMutation();

  const [followUserTrigger] = useFollowUserMutation();
  const [unfollowUserTrigger] = useUnfollowUserMutation();

  const allNotifications = useMemo(() => {
    return notificationsResponse?.data || [];
  }, [notificationsResponse?.data]);

  const filteredNotifications = useMemo(() => {
    return filterNotificationsByTab(allNotifications, activeTab);
  }, [allNotifications, activeTab]);

  const sections = useMemo(() => {
    return groupNotificationsByDate(filteredNotifications);
  }, [filteredNotifications]);

  const hasUnreadNotifications = useMemo(() => {
    return allNotifications.some((notification) => notification.read_at === null);
  }, [allNotifications]);

  const isLoadingMore = isFetching && currentPage > 1;

  const handleSelectTab = useCallback((tab: NotificationFilterTab) => {
    setActiveTab(tab);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    const meta = notificationsResponse?.meta;
    if (!meta) return;

    if (meta.current_page < meta.last_page && !isFetching) {
      setCurrentPage((previousPage) => previousPage + 1);
    }
  }, [notificationsResponse?.meta, isFetching]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsReadTrigger().unwrap();
    } catch (mutationError) {
      console.warn('Failed to mark all notifications as read:', mutationError);
    }
  }, [markAllNotificationsAsReadTrigger]);

  const handlePressNotification = useCallback(
    async (notification: NotificationItem) => {
      if (notification.read_at === null) {
        markNotificationAsReadTrigger(notification.id);
      }

      const { routeType, targetId } = resolveNotificationTarget(notification);
      if (routeType === 'post' && targetId) {
        router.push(`/posts/${targetId}`);
      } else if (routeType === 'profile' && targetId) {
        router.push({
          pathname: '/profile',
          params: { userId: targetId },
        });
      }
    },
    [markNotificationAsReadTrigger]
  );

  const handlePressActor = useCallback((notification: NotificationItem) => {
    const actorId = notification.actor_id || notification.actor?.id;
    if (actorId) {
      router.push({
        pathname: '/profile',
        params: { userId: actorId },
      });
    }
  }, []);

  const handleToggleFollowBack = useCallback(
    async (notification: NotificationItem) => {
      const actorId = notification.actor_id || notification.actor?.id;
      if (!actorId) return;

      const isCurrentlyFollowing = Boolean(notification.actor?.is_following);
      const nextFollowingState = !isCurrentlyFollowing;

      const undoCacheUpdate = updateNotificationActorFollowInCaches(
        notificationsApi,
        dispatch,
        actorId,
        nextFollowingState
      );

      try {
        if (nextFollowingState) {
          await followUserTrigger({ userId: actorId }).unwrap();
        } else {
          await unfollowUserTrigger({ userId: actorId }).unwrap();
        }
      } catch (followError) {
        undoCacheUpdate();
        console.warn('Failed to toggle follow back:', followError);
      }
    },
    [dispatch, followUserTrigger, unfollowUserTrigger]
  );

  const handlePressBack = useCallback(() => {
    router.back();
  }, []);

  return {
    activeTab,
    sections,
    hasUnreadNotifications,
    isLoading,
    isRefreshing,
    isLoadingMore,
    isMarkingAllRead,
    error,
    handleSelectTab,
    handleRefresh,
    handleLoadMore,
    handleMarkAllAsRead,
    handlePressNotification,
    handlePressActor,
    handleToggleFollowBack,
    handlePressBack,
  };
}

