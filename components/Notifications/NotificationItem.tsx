import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';

import { formatRelativeTime } from '../../utils/date';
import { formatNotificationCopy } from '../../features/notifications/utils';
import { NotificationActionButton } from './NotificationActionButton';
import { NotificationAvatarBadge } from './NotificationAvatarBadge';
import { NotificationItemProps } from './types';

export function NotificationItem({
  notification,
  onPress,
  onPressActor,
  onToggleFollowBack,
  isFollowLoading = false,
}: NotificationItemProps) {
  const theme = useTheme();

  const isUnread = notification.read_at === null;
  const copy = formatNotificationCopy(notification);
  const relativeTime = formatRelativeTime(notification.created_at);
  const isFollowNotification = notification.type === 'user_followed';
  const isFollowing = Boolean(notification.actor?.is_following);

  const handlePressRow = () => {
    onPress(notification);
  };

  const handlePressActorAvatar = () => {
    if (onPressActor) {
      onPressActor(notification);
    } else {
      onPress(notification);
    }
  };

  const handlePressFollowAction = () => {
    onToggleFollowBack?.(notification);
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={copy.fullMessage}
      activeOpacity={0.8}
      onPress={handlePressRow}
      style={[
        styles.rowContainer,
        {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.outlineVariant,
        },
      ]}
    >
      {/* Unread indicator slot */}
      <View style={styles.indicatorSlot}>
        {isUnread ? (
          <View
            style={[
              styles.unreadDot,
              { backgroundColor: theme.colors.primary },
            ]}
          />
        ) : null}
      </View>

      {/* Avatar Badge */}
      <View style={styles.avatarSlot}>
        <NotificationAvatarBadge
          actor={notification.actor}
          type={notification.type}
          onPress={handlePressActorAvatar}
        />
      </View>

      {/* Content Column */}
      <View style={styles.contentColumn}>
        <Text
          numberOfLines={3}
          style={[styles.messageText, { color: theme.colors.onBackground }]}
        >
          <Text
            onPress={handlePressActorAvatar}
            style={[styles.actorBold, { color: theme.colors.onBackground }]}
          >
            {copy.actorSummary}
          </Text>
          <Text style={[styles.actionRegular, { color: theme.colors.onBackground }]}>
            {` ${copy.actionDescription}`}
          </Text>
        </Text>

        {copy.quoteSnippet ? (
          <Text
            numberOfLines={2}
            style={[
              styles.quoteText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {`“${copy.quoteSnippet}”`}
          </Text>
        ) : null}

        <Text
          style={[
            styles.timestampText,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {relativeTime}
        </Text>
      </View>

      {/* Follow Back Action Slot */}
      {isFollowNotification && onToggleFollowBack ? (
        <View style={styles.actionSlot}>
          <NotificationActionButton
            isFollowing={isFollowing}
            onPress={handlePressFollowAction}
            isLoading={isFollowLoading}
          />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingRight: 16,
    paddingLeft: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  indicatorSlot: {
    width: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 18,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  avatarSlot: {
    marginRight: 12,
  },
  contentColumn: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 2,
    marginRight: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  actorBold: {
    fontWeight: '700',
  },
  actionRegular: {
    fontWeight: '400',
  },
  quoteText: {
    fontSize: 14,
    lineHeight: 19,
    marginTop: 4,
  },
  timestampText: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  actionSlot: {
    alignSelf: 'center',
    marginLeft: 6,
  },
});

