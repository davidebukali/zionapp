import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import { TabItem, Tabs } from '../Common/Tabs';
import { NotificationFilterTab } from '../../features/notifications/types';
import { NotificationTabsProps } from './types';

const NOTIFICATION_TABS: Array<TabItem<NotificationFilterTab>> = [
  { key: 'all', label: 'All' },
  { key: 'mentions', label: 'Mentions' },
];

export function NotificationTabs({
  activeTab,
  onSelectTab,
}: NotificationTabsProps) {
  const theme = useTheme();

  return (
    <Tabs<NotificationFilterTab>
      tabs={NOTIFICATION_TABS}
      activeTab={activeTab}
      onSelectTab={onSelectTab}
      style={[
        styles.tabsContainer,
        { backgroundColor: theme.colors.background },
      ]}
      tabButtonStyle={styles.tabButton}
      tabLabelStyle={styles.tabLabel}
      activeIndicatorStyle={[
        styles.activeIndicator,
        { backgroundColor: theme.colors.primary },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    borderBottomWidth: 0,
    paddingHorizontal: 8,
    width: '100%',
  },
  tabButton: {
    flex: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabLabel: {
    fontSize: 16,
    letterSpacing: 0.1,
  },
  activeIndicator: {
    left: 14,
    right: 14,
    height: 3,
    borderRadius: 2,
    bottom: 0,
  },
});

