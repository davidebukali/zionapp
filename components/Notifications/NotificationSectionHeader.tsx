import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';

import { NotificationSectionHeaderProps } from './types';

export function NotificationSectionHeader({
  title,
  showMarkAllRead = false,
  onMarkAllRead,
  isMarkingAllRead = false,
}: NotificationSectionHeaderProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text
        style={[
          styles.titleText,
          { color: theme.colors.onSurfaceVariant },
        ]}
      >
        {title}
      </Text>

      {showMarkAllRead && onMarkAllRead ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Mark all as read"
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
          onPress={onMarkAllRead}
          disabled={isMarkingAllRead}
          activeOpacity={0.7}
          style={styles.markAllButton}
        >
          {isMarkingAllRead ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text
              style={[
                styles.markAllText,
                { color: theme.colors.primary },
              ]}
            >
              Mark all read
            </Text>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  markAllButton: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  markAllText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

