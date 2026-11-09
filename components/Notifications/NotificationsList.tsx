import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';

import { globalStyles } from '../../assets/styles/theme';
import { ErrorStateView } from '../Common/ErrorStateView';
import {
  NotificationItem as NotificationItemType,
  NotificationSection,
} from '../../features/notifications/types';
import { NotificationItem } from './NotificationItem';
import { NotificationSectionHeader } from './NotificationSectionHeader';
import { NotificationsListProps } from './types';

export function NotificationsList({
  sections,
  activeTab,
  hasUnreadNotifications,
  isLoading,
  isRefreshing,
  isLoadingMore,
  isMarkingAllRead,
  error,
  onRefresh,
  onLoadMore,
  onMarkAllRead,
  onPressNotification,
  onPressActor,
  onToggleFollowBack,
}: NotificationsListProps) {
  const theme = useTheme();

  if (isLoading && sections.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error && sections.length === 0) {
    return (
      <ErrorStateView
        error={error}
        title="Could Not Load Notifications"
        message="Please check your connection and pull down to refresh."
        onRetry={onRefresh}
        isRetrying={isRefreshing}
      />
    );
  }

  const renderEmptyState = () => {
    const emptyTitle =
      activeTab === 'mentions'
        ? 'No mentions yet'
        : 'No activity yet';
    const emptyIcon =
      activeTab === 'mentions'
        ? 'at-outline'
        : 'notifications-outline';

    return (
      <View style={globalStyles.commentsCenteredState}>
        <Ionicons
          name={emptyIcon}
          size={56}
          color={theme.colors.onSurfaceVariant}
        />
        <Text
          style={[
            globalStyles.commentsStateText,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {emptyTitle}
        </Text>
      </View>
    );
  };

  const renderSectionHeader = ({
    section,
  }: {
    section: NotificationSection;
  }) => {
    const isFirstSection = sections.length > 0 && sections[0].title === section.title;
    const showMarkAll = isFirstSection && hasUnreadNotifications;

    return (
      <NotificationSectionHeader
        title={section.title}
        showMarkAllRead={showMarkAll}
        onMarkAllRead={onMarkAllRead}
        isMarkingAllRead={isMarkingAllRead}
      />
    );
  };

  const renderItem = ({ item }: { item: NotificationItemType }) => (
    <NotificationItem
      notification={item}
      onPress={onPressNotification}
      onPressActor={onPressActor}
      onToggleFollowBack={onToggleFollowBack}
    />
  );

  const renderFooter = () => {
    if (!isLoadingMore) {
      return <View style={styles.footerSpacing} />;
    }
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  return (
    <SectionList<NotificationItemType, NotificationSection>
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={renderFooter}
      contentContainerStyle={
        sections.length === 0
          ? styles.emptyListContainer
          : styles.listContentContainer
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.4}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  listContentContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  footerLoader: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerSpacing: {
    height: 16,
  },
});

