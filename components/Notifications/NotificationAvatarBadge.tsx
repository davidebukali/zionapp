import React, { memo } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';

import {
  getAvatarColor,
  getUserAvatarUrl,
  getUserInitials,
} from '../../utils/user';
import {
  getNotificationBadgeVariant,
} from '../../features/notifications/utils';
import { NotificationBadgeVariant } from '../../features/notifications/types';
import { NotificationAvatarBadgeProps } from './types';

interface BadgeConfig {
  iconName: keyof typeof Ionicons.glyphMap;
  sizeOffset?: number;
  usePrimaryColor?: boolean;
}

const BADGE_CONFIG_MAP: Record<NotificationBadgeVariant, BadgeConfig> = {
  like: {
    iconName: 'heart',
    usePrimaryColor: true,
  },
  comment: {
    iconName: 'chatbubble-outline',
    sizeOffset: -2,
  },
  mention: {
    iconName: 'at',
  },
  repost: {
    iconName: 'repeat',
  },
  follow: {
    iconName: 'person-add-outline',
    sizeOffset: -2,
  },
};

export const NotificationAvatarBadge = memo(function NotificationAvatarBadge({
  actor,
  type,
  onPress,
  size = 48,
}: NotificationAvatarBadgeProps) {
  const theme = useTheme();

  const avatarUrl = getUserAvatarUrl(actor);
  const initials = getUserInitials(actor?.name, actor?.email);
  const badgeVariant = getNotificationBadgeVariant(type);
  const badgeConfig = BADGE_CONFIG_MAP[badgeVariant];

  const borderRadius = Math.round(size / 2);
  const badgeSize = Math.max(20, Math.round(size * 0.44));
  const badgeRadius = Math.round(badgeSize / 2);
  const baseIconSize = Math.round(badgeSize * 0.58);
  const iconSize = baseIconSize + (badgeConfig?.sizeOffset ?? 0);

  const actorIdentifier =
    actor?.id || actor?.name || actor?.email || 'unknown';
  const avatarBgColor = getAvatarColor(actorIdentifier);

  const badgeBackgroundColor = badgeConfig?.usePrimaryColor
    ? theme.colors.primary
    : theme.colors.surfaceVariant;
  const badgeIconColor = badgeConfig?.usePrimaryColor
    ? '#FFFFFF'
    : theme.colors.onSurface;

  const content = (
    <View style={[styles.avatarWrapper, { width: size, height: size }]}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: size, height: size, borderRadius }}
        />
      ) : (
        <View
          style={[
            styles.fallbackCircle,
            {
              width: size,
              height: size,
              borderRadius,
              backgroundColor: avatarBgColor,
            },
          ]}
        >
          <Text
            style={[
              styles.initialsText,
              { fontSize: Math.round(size * 0.36) },
            ]}
          >
            {initials}
          </Text>
        </View>
      )}

      {badgeConfig && (
        <View
          style={[
            styles.badgeCircle,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeRadius,
              backgroundColor: badgeBackgroundColor,
              borderColor: theme.colors.background,
            },
          ]}
        >
          <Ionicons
            name={badgeConfig.iconName}
            size={iconSize}
            color={badgeIconColor}
          />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`View profile of ${actor?.name || 'user'}`}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
});

const styles = StyleSheet.create({
  avatarWrapper: {
    position: 'relative',
  },
  fallbackCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeCircle: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
