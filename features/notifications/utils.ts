import { isToday, isYesterday, isValid, parseISO } from 'date-fns';
import * as SecureStore from 'expo-secure-store';
import {
  DeviceNotificationPreferences,
  FormattedNotificationCopy,
  GenericNotificationData,
  GroupedPostLikedData,
  NotificationBadgeVariant,
  NotificationFilterTab,
  NotificationItem,
  NotificationSection,
  NotificationsResponse,
  NotificationType,
} from './types';

const NOTIFICATION_ACTION_COPY: Partial<Record<NotificationType, string>> = {
  comment_liked: 'liked your comment',
  post_reposted: 'reposted your post',
  post_shared: 'shared your post',
  user_followed: 'started following you',
  follow_requested: 'requested to follow you',
  follow_request_accepted: 'accepted your follow request',
  user_tagged: 'mentioned you in a thread',
};

const BADGE_VARIANT_MAP: Record<NotificationType, NotificationBadgeVariant> = {
  post_liked: 'like',
  comment_liked: 'like',
  post_commented: 'comment',
  user_tagged: 'mention',
  post_reposted: 'repost',
  post_shared: 'repost',
  user_followed: 'follow',
  follow_requested: 'follow',
  follow_request_accepted: 'follow',
  post_reported: 'like',
};

/**
 * Resolves the primary actor's display name or fallback name.
 */
export function getActorDisplayName(notification: NotificationItem): string {
  const profileName = notification.actor?.profile?.display_name?.trim();
  if (profileName) {
    return profileName;
  }

  const actorName = notification.actor?.name?.trim();
  if (actorName) {
    return actorName;
  }

  const genericData = notification.data as GenericNotificationData;
  const genericActorName = genericData?.actor_name?.trim();
  if (genericActorName) {
    return genericActorName;
  }

  return 'Someone';
}

/**
 * Generates the notification message for grouped or single post_liked notifications.
 */
export function getPostLikedMessage(notification: NotificationItem): string {
  const actorName = getActorDisplayName(notification);
  const postLikedData = notification.data as GroupedPostLikedData;
  const likersCount = postLikedData?.actors_count ?? 1;

  if (likersCount <= 1) {
    return `${actorName} liked your post.`;
  }
  if (likersCount === 2) {
    return `${actorName} and 1 other liked your post.`;
  }
  return `${actorName} and ${likersCount - 1} others liked your post.`;
}

/**
 * Formats structured copy for notification items, separating actor summary,
 * action description, full readable message, and optional quote snippet.
 */
export function formatNotificationCopy(
  notification: NotificationItem
): FormattedNotificationCopy {
  const actorName = getActorDisplayName(notification);

  if (notification.type === 'post_liked') {
    const postLikedData = notification.data as GroupedPostLikedData;
    const likersCount = postLikedData?.actors_count ?? 1;

    let actorSummary = actorName;
    if (likersCount === 2) {
      actorSummary = `${actorName} and 1 other`;
    } else if (likersCount > 2) {
      actorSummary = `${actorName} and ${likersCount - 1} others`;
    }

    const actionDescription = 'liked your post';
    return {
      actorSummary,
      actionDescription,
      fullMessage: `${actorSummary} ${actionDescription}`,
    };
  }

  if (notification.type === 'post_commented') {
    const genericData = notification.data as GenericNotificationData;
    const actionDescription = 'commented on your post';
    const quoteSnippet =
      genericData?.comment_content?.trim() ||
      genericData?.content?.trim() ||
      undefined;

    return {
      actorSummary: actorName,
      actionDescription,
      fullMessage: `${actorName} ${actionDescription}`,
      quoteSnippet,
    };
  }

  if (notification.type === 'post_reported') {
    const actionDescription = 'Your post was flagged for review';
    return {
      actorSummary: 'System',
      actionDescription,
      fullMessage: actionDescription,
    };
  }

  const actionDescription =
    NOTIFICATION_ACTION_COPY[notification.type] || 'sent you a notification';

  return {
    actorSummary: actorName,
    actionDescription,
    fullMessage: `${actorName} ${actionDescription}`,
  };
}

/**
 * Maps notification type to its badge variant for avatar rendering.
 */
export function getNotificationBadgeVariant(
  type: NotificationType
): NotificationBadgeVariant {
  return BADGE_VARIANT_MAP[type] ?? 'like';
}

/**
 * Helper to extract associated post ID from notification data or notifiable fields.
 */
function getNotificationPostId(notification: NotificationItem): string | null {
  const genericData = notification.data as GenericNotificationData;
  if (genericData?.post_id) {
    return genericData.post_id;
  }
  if (notification.notifiable_type?.includes('Post') && notification.notifiable_id) {
    return notification.notifiable_id;
  }
  return null;
}

/**
 * Helper to extract associated actor ID from notification fields.
 */
function getNotificationActorId(notification: NotificationItem): string | null {
  return notification.actor_id || notification.actor?.id || null;
}

/**
 * Resolves the destination route target when a notification is tapped.
 */
export function resolveNotificationTarget(notification: NotificationItem): {
  routeType: 'post' | 'profile' | 'none';
  targetId: string | null;
} {
  switch (notification.type) {
    case 'user_followed':
    case 'follow_requested':
    case 'follow_request_accepted': {
      const targetActorId = getNotificationActorId(notification);
      return {
        routeType: targetActorId ? 'profile' : 'none',
        targetId: targetActorId,
      };
    }

    case 'post_liked':
    case 'comment_liked':
    case 'post_commented':
    case 'post_reposted':
    case 'post_shared':
    case 'post_reported': {
      const targetPostId = getNotificationPostId(notification);
      return {
        routeType: targetPostId ? 'post' : 'none',
        targetId: targetPostId,
      };
    }

    case 'user_tagged': {
      const targetPostId = getNotificationPostId(notification);
      if (targetPostId) {
        return {
          routeType: 'post',
          targetId: targetPostId,
        };
      }

      const targetActorId = getNotificationActorId(notification);
      return {
        routeType: targetActorId ? 'profile' : 'none',
        targetId: targetActorId,
      };
    }

    default:
      return { routeType: 'none', targetId: null };
  }
}

/**
 * Filters notification list according to selected filter tab.
 */
export function filterNotificationsByTab(
  notifications: NotificationItem[],
  activeTab: NotificationFilterTab
): NotificationItem[] {
  if (activeTab === 'mentions') {
    return notifications.filter(
      (notification) => notification.type === 'user_tagged'
    );
  }
  return notifications;
}

/**
 * Groups a flat array of notifications into chronological sections:
 * "Today", "Yesterday", and "Earlier". Empty sections are excluded.
 */
export function groupNotificationsByDate(
  notifications: NotificationItem[]
): NotificationSection[] {
  const todayItems: NotificationItem[] = [];
  const yesterdayItems: NotificationItem[] = [];
  const earlierItems: NotificationItem[] = [];

  for (const notification of notifications) {
    const parsedDate = parseISO(notification.created_at);
    if (!isValid(parsedDate)) {
      earlierItems.push(notification);
      continue;
    }

    if (isToday(parsedDate)) {
      todayItems.push(notification);
    } else if (isYesterday(parsedDate)) {
      yesterdayItems.push(notification);
    } else {
      earlierItems.push(notification);
    }
  }

  const sections: NotificationSection[] = [];
  if (todayItems.length > 0) {
    sections.push({ title: 'Today', data: todayItems });
  }
  if (yesterdayItems.length > 0) {
    sections.push({ title: 'Yesterday', data: yesterdayItems });
  }
  if (earlierItems.length > 0) {
    sections.push({ title: 'Earlier', data: earlierItems });
  }

  return sections;
}

/**
 * Deduplicates and appends incoming notification items into an existing list.
 */
export function mergeUniqueNotifications(
  existingItems: NotificationItem[],
  incomingItems: NotificationItem[]
): NotificationItem[] {
  const existingIdSet = new Set(existingItems.map((item) => item.id));
  const uniqueIncoming = incomingItems.filter(
    (item) => !existingIdSet.has(item.id)
  );
  return [...existingItems, ...uniqueIncoming];
}

/**
 * Merges paginated RTK Query cache responses. Replaces on page 1, appends on subsequent pages.
 */
export function mergeNotificationsCache(
  currentCache: NotificationsResponse,
  incomingResponse: NotificationsResponse,
  requestedPage?: number
): void {
  if (!requestedPage || requestedPage <= 1) {
    currentCache.data = incomingResponse.data;
    currentCache.links = incomingResponse.links;
    currentCache.meta = incomingResponse.meta;
    return;
  }

  currentCache.data = mergeUniqueNotifications(
    currentCache.data,
    incomingResponse.data
  );
  currentCache.links = incomingResponse.links;
  currentCache.meta = incomingResponse.meta;
}

/**
 * Internal helper to dispatch optimistic RTK Query updates and return an undo rollback function.
 */
function patchNotificationsCache(
  api: any,
  dispatch: any,
  recipe: (draft: NotificationsResponse) => void
): () => void {
  const patch = dispatch(
    api.util.updateQueryData(
      'getNotifications',
      undefined,
      (draft: NotificationsResponse) => {
        if (!draft?.data) return;
        recipe(draft);
      }
    )
  );

  return () => {
    patch.undo();
  };
}

/**
 * Optimistically marks a single notification as read across active RTK Query caches.
 * Dependency Injection: accepts `api` and `dispatch` as parameters to avoid circular dependencies.
 */
export function markNotificationReadInCaches(
  api: any,
  dispatch: any,
  notificationId: string,
  readTimestamp: string
): () => void {
  return patchNotificationsCache(api, dispatch, (draft) => {
    const target = draft.data.find(
      (notification) => notification.id === notificationId
    );
    if (target && target.read_at === null) {
      target.read_at = readTimestamp;
    }
  });
}

/**
 * Optimistically marks all notifications as read across active RTK Query caches.
 * Dependency Injection: accepts `api` and `dispatch` as parameters to avoid circular dependencies.
 */
export function markAllNotificationsReadInCaches(
  api: any,
  dispatch: any,
  readTimestamp: string
): () => void {
  return patchNotificationsCache(api, dispatch, (draft) => {
    for (const notification of draft.data) {
      if (notification.read_at === null) {
        notification.read_at = readTimestamp;
      }
    }
  });
}

/**
 * Optimistically updates the actor's following state across notification items.
 * Dependency Injection: accepts `api` and `dispatch` as parameters to avoid circular dependencies.
 */
export function updateNotificationActorFollowInCaches(
  api: any,
  dispatch: any,
  actorId: string,
  isFollowing: boolean
): () => void {
  return patchNotificationsCache(api, dispatch, (draft) => {
    for (const notification of draft.data) {
      if (
        (notification.actor_id === actorId ||
          notification.actor?.id === actorId) &&
        notification.actor
      ) {
        notification.actor.is_following = isFollowing;
      }
    }
  });
}

export const NOTIFICATION_PREFERENCES_KEY = 'zion_notification_preferences';

export const DEFAULT_NOTIFICATION_PREFERENCES: DeviceNotificationPreferences = {
  pushNotifications: true,
  likes: true,
  comments: true,
  mentions: true,
  reposts: true,
  followers: true,
};

/**
 * Loads device-level push notification preferences from local secure store.
 */
export async function loadNotificationPreferences(): Promise<DeviceNotificationPreferences> {
  try {
    const raw = await SecureStore.getItemAsync(NOTIFICATION_PREFERENCES_KEY);
    if (!raw) {
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }
    const parsed = JSON.parse(raw);
    return {
      pushNotifications:
        typeof parsed.pushNotifications === 'boolean'
          ? parsed.pushNotifications
          : true,
      likes: typeof parsed.likes === 'boolean' ? parsed.likes : true,
      comments: typeof parsed.comments === 'boolean' ? parsed.comments : true,
      mentions: typeof parsed.mentions === 'boolean' ? parsed.mentions : true,
      reposts: typeof parsed.reposts === 'boolean' ? parsed.reposts : true,
      followers: typeof parsed.followers === 'boolean' ? parsed.followers : true,
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

/**
 * Saves device-level push notification preferences to local secure store.
 */
export async function saveNotificationPreferences(
  preferences: DeviceNotificationPreferences
): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      NOTIFICATION_PREFERENCES_KEY,
      JSON.stringify(preferences)
    );
  } catch {
    // Gracefully ignore storage failures
  }
}

/**
 * Determines whether a given incoming push notification should be delivered
 * locally on this device based on user's device notification preferences.
 */
export function shouldDeliverForegroundPush(
  preferences: DeviceNotificationPreferences,
  notificationType?: NotificationType
): boolean {
  if (!preferences.pushNotifications) {
    return false;
  }
  if (!notificationType) {
    return true;
  }
  switch (notificationType) {
    case 'post_liked':
    case 'comment_liked':
      return preferences.likes;
    case 'post_commented':
      return preferences.comments;
    case 'user_tagged':
      return preferences.mentions;
    case 'post_reposted':
    case 'post_shared':
      return preferences.reposts;
    case 'user_followed':
    case 'follow_requested':
    case 'follow_request_accepted':
      return preferences.followers;
    default:
      return true;
  }
}
