import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from 'react-native-paper';

import { NotificationActionButtonProps } from './types';

export function NotificationActionButton({
  isFollowing = false,
  onPress,
  isLoading = false,
}: NotificationActionButtonProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={isFollowing ? 'Following' : 'Follow back'}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.75}
      style={[
        styles.actionPill,
        isFollowing
          ? [
              styles.followingPill,
              { backgroundColor: theme.colors.surfaceVariant },
            ]
          : [
              styles.followBackPill,
              {
                borderColor: theme.colors.outline,
                backgroundColor: 'transparent',
              },
            ],
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={
            isFollowing ? theme.colors.onSurfaceVariant : theme.colors.onBackground
          }
        />
      ) : (
        <Text
          style={[
            styles.actionText,
            {
              color: isFollowing
                ? theme.colors.onSurfaceVariant
                : theme.colors.onBackground,
            },
          ]}
        >
          {isFollowing ? 'Following' : 'Follow back'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  actionPill: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  followBackPill: {
    borderWidth: 1,
  },
  followingPill: {
    borderWidth: 0,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});

