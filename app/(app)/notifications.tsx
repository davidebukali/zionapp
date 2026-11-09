import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { globalStyles } from '../../assets/styles/theme';
import {
  NotificationHeader,
  NotificationsList,
  NotificationTabs,
} from '../../components/Notifications';
import { useNotifications } from '../../hooks/useNotifications';

export default function NotificationsScreen() {
  const theme = useTheme();
  const {
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
  } = useNotifications();

  return (
    <View
      style={[
        globalStyles.screen,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <NotificationHeader onBack={handlePressBack} />
      <NotificationTabs activeTab={activeTab} onSelectTab={handleSelectTab} />
      <NotificationsList
        sections={sections}
        activeTab={activeTab}
        hasUnreadNotifications={hasUnreadNotifications}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        isLoadingMore={isLoadingMore}
        isMarkingAllRead={isMarkingAllRead}
        error={error}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        onMarkAllRead={handleMarkAllAsRead}
        onPressNotification={handlePressNotification}
        onPressActor={handlePressActor}
        onToggleFollowBack={handleToggleFollowBack}
      />
    </View>
  );
}
