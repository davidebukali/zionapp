import {
  filterNotificationsByTab,
  formatNotificationCopy,
  getActorDisplayName,
  getNotificationBadgeVariant,
  getPostLikedMessage,
  groupNotificationsByDate,
  markAllNotificationsReadInCaches,
  markNotificationReadInCaches,
  mergeNotificationsCache,
  mergeUniqueNotifications,
  resolveNotificationTarget,
  updateNotificationActorFollowInCaches,
} from './utils';
import { NotificationItem, NotificationsResponse } from './types';

function createMockNotification(
  overrides?: Partial<NotificationItem>
): NotificationItem {
  return {
    id: '01JCHABC1234567890ABCDEF01',
    user_id: '01JCHREC1234567890ABCDEF02',
    actor_id: '01JCHACT1234567890ABCDEF03',
    actor: {
      id: '01JCHACT1234567890ABCDEF03',
      name: 'Jane Doe',
      email: 'jane@example.com',
      is_following: false,
      profile: {
        id: '01JCHPRF1234567890ABCDEF04',
        user_id: '01JCHACT1234567890ABCDEF03',
        username: 'janedoe',
        display_name: 'Jane',
        is_private: false,
      },
    },
    type: 'post_liked',
    notifiable_type: 'Modules\\Posts\\Models\\Post',
    notifiable_id: '01JCHPST1234567890ABCDEF06',
    data: {
      event: 'post_liked',
      post_id: '01JCHPST1234567890ABCDEF06',
      actors_count: 1,
      actor_ids: ['01JCHACT1234567890ABCDEF03'],
    },
    read_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('features/notifications/utils', () => {
  describe('getActorDisplayName', () => {
    it('prefers profile display_name', () => {
      const notification = createMockNotification();
      expect(getActorDisplayName(notification)).toBe('Jane');
    });

    it('falls back to actor name if display_name is missing', () => {
      const notification = createMockNotification({
        actor: {
          id: '123',
          name: 'Jane Doe',
          email: 'jane@example.com',
          profile: null,
        },
      });
      expect(getActorDisplayName(notification)).toBe('Jane Doe');
    });

    it('falls back to generic actor_name in data payload', () => {
      const notification = createMockNotification({
        actor: null,
        data: { actor_name: 'Fallback Actor' },
      });
      expect(getActorDisplayName(notification)).toBe('Fallback Actor');
    });

    it('returns Someone if all names are missing', () => {
      const notification = createMockNotification({
        actor: null,
        data: {},
      });
      expect(getActorDisplayName(notification)).toBe('Someone');
    });
  });

  describe('getPostLikedMessage', () => {
    it('formats single liker', () => {
      const notification = createMockNotification({
        data: {
          event: 'post_liked',
          post_id: 'post_1',
          actors_count: 1,
          actor_ids: ['1'],
        },
      });
      expect(getPostLikedMessage(notification)).toBe('Jane liked your post.');
    });

    it('formats exactly 2 likers', () => {
      const notification = createMockNotification({
        data: {
          event: 'post_liked',
          post_id: 'post_1',
          actors_count: 2,
          actor_ids: ['1', '2'],
        },
      });
      expect(getPostLikedMessage(notification)).toBe(
        'Jane and 1 other liked your post.'
      );
    });

    it('formats 3 or more likers', () => {
      const notification = createMockNotification({
        data: {
          event: 'post_liked',
          post_id: 'post_1',
          actors_count: 14,
          actor_ids: ['1', '2', '3'],
        },
      });
      expect(getPostLikedMessage(notification)).toBe(
        'Jane and 13 others liked your post.'
      );
    });
  });

  describe('formatNotificationCopy', () => {
    it('formats post_liked correctly', () => {
      const single = createMockNotification({ type: 'post_liked' });
      expect(formatNotificationCopy(single)).toEqual({
        actorSummary: 'Jane',
        actionDescription: 'liked your post',
        fullMessage: 'Jane liked your post',
      });

      const grouped = createMockNotification({
        type: 'post_liked',
        data: {
          event: 'post_liked',
          post_id: 'post_1',
          actors_count: 4,
          actor_ids: ['1', '2'],
        },
      });
      expect(formatNotificationCopy(grouped)).toEqual({
        actorSummary: 'Jane and 3 others',
        actionDescription: 'liked your post',
        fullMessage: 'Jane and 3 others liked your post',
      });
    });

    it('formats post_commented with quote snippet', () => {
      const notification = createMockNotification({
        type: 'post_commented',
        data: {
          actor_name: 'Jordan',
          comment_content: 'this is exactly the vibe',
        },
      });
      const copy = formatNotificationCopy(notification);
      expect(copy.actionDescription).toBe('commented on your post');
      expect(copy.quoteSnippet).toBe('this is exactly the vibe');
    });

    it('formats user_followed', () => {
      const notification = createMockNotification({ type: 'user_followed' });
      const copy = formatNotificationCopy(notification);
      expect(copy.actionDescription).toBe('started following you');
    });

    it('formats user_tagged', () => {
      const notification = createMockNotification({ type: 'user_tagged' });
      const copy = formatNotificationCopy(notification);
      expect(copy.actionDescription).toBe('mentioned you in a thread');
    });

    it('formats post_reposted', () => {
      const notification = createMockNotification({ type: 'post_reposted' });
      const copy = formatNotificationCopy(notification);
      expect(copy.actionDescription).toBe('reposted your post');
    });

    it('formats post_reported as system alert', () => {
      const notification = createMockNotification({ type: 'post_reported' });
      const copy = formatNotificationCopy(notification);
      expect(copy.actorSummary).toBe('System');
      expect(copy.actionDescription).toBe('Your post was flagged for review');
    });
  });

  describe('getNotificationBadgeVariant', () => {
    it('resolves correct badge icon variants', () => {
      expect(getNotificationBadgeVariant('post_liked')).toBe('like');
      expect(getNotificationBadgeVariant('comment_liked')).toBe('like');
      expect(getNotificationBadgeVariant('post_commented')).toBe('comment');
      expect(getNotificationBadgeVariant('user_tagged')).toBe('mention');
      expect(getNotificationBadgeVariant('post_reposted')).toBe('repost');
      expect(getNotificationBadgeVariant('post_shared')).toBe('repost');
      expect(getNotificationBadgeVariant('user_followed')).toBe('follow');
    });
  });

  describe('resolveNotificationTarget', () => {
    it('resolves post routes for post-related notifications', () => {
      const notification = createMockNotification({
        type: 'post_liked',
        data: { post_id: 'post_999' },
      });
      expect(resolveNotificationTarget(notification)).toEqual({
        routeType: 'post',
        targetId: 'post_999',
      });
    });

    it('resolves profile routes for user-related notifications', () => {
      const notification = createMockNotification({
        type: 'user_followed',
        actor_id: 'actor_777',
      });
      expect(resolveNotificationTarget(notification)).toEqual({
        routeType: 'profile',
        targetId: 'actor_777',
      });
    });
  });

  describe('filterNotificationsByTab', () => {
    it('returns all notifications when tab is all', () => {
      const items = [
        createMockNotification({ id: '1', type: 'post_liked' }),
        createMockNotification({ id: '2', type: 'user_tagged' }),
      ];
      expect(filterNotificationsByTab(items, 'all')).toHaveLength(2);
    });

    it('filters for user_tagged when tab is mentions', () => {
      const items = [
        createMockNotification({ id: '1', type: 'post_liked' }),
        createMockNotification({ id: '2', type: 'user_tagged' }),
      ];
      const filtered = filterNotificationsByTab(items, 'mentions');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('2');
    });
  });

  describe('groupNotificationsByDate', () => {
    it('groups notifications into Today, Yesterday, and Earlier sections', () => {
      const todayDate = new Date().toISOString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toISOString();
      const earlierDate = new Date(2025, 1, 1).toISOString();

      const items = [
        createMockNotification({ id: '1', created_at: todayDate }),
        createMockNotification({ id: '2', created_at: yesterdayDate }),
        createMockNotification({ id: '3', created_at: earlierDate }),
      ];

      const sections = groupNotificationsByDate(items);
      expect(sections).toHaveLength(3);
      expect(sections[0].title).toBe('Today');
      expect(sections[0].data).toHaveLength(1);
      expect(sections[1].title).toBe('Yesterday');
      expect(sections[1].data).toHaveLength(1);
      expect(sections[2].title).toBe('Earlier');
      expect(sections[2].data).toHaveLength(1);
    });
  });

  describe('mergeUniqueNotifications and mergeNotificationsCache', () => {
    it('deduplicates incoming items by id', () => {
      const existing = [createMockNotification({ id: '1' })];
      const incoming = [
        createMockNotification({ id: '1' }),
        createMockNotification({ id: '2' }),
      ];
      const merged = mergeUniqueNotifications(existing, incoming);
      expect(merged).toHaveLength(2);
      expect(merged.map((item) => item.id)).toEqual(['1', '2']);
    });

    it('replaces cache on page 1 and appends on page 2', () => {
      const currentCache: NotificationsResponse = {
        data: [createMockNotification({ id: '1' })],
        links: { first: '', last: '', prev: null, next: null },
        meta: {
          current_page: 1,
          from: 1,
          last_page: 2,
          path: '',
          per_page: 1,
          to: 1,
          total: 2,
        },
      };

      const page2Response: NotificationsResponse = {
        data: [createMockNotification({ id: '2' })],
        links: { first: '', last: '', prev: null, next: null },
        meta: {
          current_page: 2,
          from: 2,
          last_page: 2,
          path: '',
          per_page: 1,
          to: 2,
          total: 2,
        },
      };

      mergeNotificationsCache(currentCache, page2Response, 2);
      expect(currentCache.data).toHaveLength(2);
      expect(currentCache.meta.current_page).toBe(2);
    });
  });

  describe('optimistic cache update helpers', () => {
    it('markNotificationReadInCaches updates read_at and supports rollback', () => {
      let cachedData: NotificationsResponse = {
        data: [
          createMockNotification({ id: 'item_1', read_at: null }),
          createMockNotification({ id: 'item_2', read_at: null }),
        ],
        links: { first: '', last: '', prev: null, next: null },
        meta: {
          current_page: 1,
          from: 1,
          last_page: 1,
          path: '',
          per_page: 2,
          to: 2,
          total: 2,
        },
      };

      const mockApi = {
        util: {
          updateQueryData:
            (endpoint: string, args: any, recipe: (draft: any) => void) => () => {
              const previous = JSON.parse(JSON.stringify(cachedData));
              recipe(cachedData);
              return {
                undo: () => {
                  cachedData = previous;
                },
              };
            },
        },
      };

      const mockDispatch = (actionThunk: any) => actionThunk();

      const rollback = markNotificationReadInCaches(
        mockApi,
        mockDispatch,
        'item_1',
        '2026-11-09T14:00:00Z'
      );

      expect(cachedData.data[0].read_at).toBe('2026-11-09T14:00:00Z');
      expect(cachedData.data[1].read_at).toBeNull();

      rollback();
      expect(cachedData.data[0].read_at).toBeNull();
    });

    it('markAllNotificationsReadInCaches marks all unread items as read', () => {
      let cachedData: NotificationsResponse = {
        data: [
          createMockNotification({ id: 'item_1', read_at: null }),
          createMockNotification({ id: 'item_2', read_at: null }),
        ],
        links: { first: '', last: '', prev: null, next: null },
        meta: {
          current_page: 1,
          from: 1,
          last_page: 1,
          path: '',
          per_page: 2,
          to: 2,
          total: 2,
        },
      };

      const mockApi = {
        util: {
          updateQueryData:
            (endpoint: string, args: any, recipe: (draft: any) => void) => () => {
              const previous = JSON.parse(JSON.stringify(cachedData));
              recipe(cachedData);
              return {
                undo: () => {
                  cachedData = previous;
                },
              };
            },
        },
      };

      const mockDispatch = (actionThunk: any) => actionThunk();

      const rollback = markAllNotificationsReadInCaches(
        mockApi,
        mockDispatch,
        '2026-11-09T14:00:00Z'
      );

      expect(cachedData.data[0].read_at).toBe('2026-11-09T14:00:00Z');
      expect(cachedData.data[1].read_at).toBe('2026-11-09T14:00:00Z');

      rollback();
      expect(cachedData.data[0].read_at).toBeNull();
      expect(cachedData.data[1].read_at).toBeNull();
    });

    it('updateNotificationActorFollowInCaches toggles actor is_following state', () => {
      let cachedData: NotificationsResponse = {
        data: [
          createMockNotification({
            id: 'item_1',
            actor_id: 'actor_100',
            actor: {
              id: 'actor_100',
              name: 'Actor One',
              email: 'a@example.com',
              is_following: false,
            },
          }),
        ],
        links: { first: '', last: '', prev: null, next: null },
        meta: {
          current_page: 1,
          from: 1,
          last_page: 1,
          path: '',
          per_page: 1,
          to: 1,
          total: 1,
        },
      };

      const mockApi = {
        util: {
          updateQueryData:
            (endpoint: string, args: any, recipe: (draft: any) => void) => () => {
              const previous = JSON.parse(JSON.stringify(cachedData));
              recipe(cachedData);
              return {
                undo: () => {
                  cachedData = previous;
                },
              };
            },
        },
      };

      const mockDispatch = (actionThunk: any) => actionThunk();

      const rollback = updateNotificationActorFollowInCaches(
        mockApi,
        mockDispatch,
        'actor_100',
        true
      );

      expect(cachedData.data[0].actor?.is_following).toBe(true);

      rollback();
      expect(cachedData.data[0].actor?.is_following).toBe(false);
    });
  });
});

