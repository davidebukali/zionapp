import {
  normalizePost,
  normalizeCursorPaginatedPosts,
  mergeCursorPaginatedPosts,
  mergeUniquePosts,
  updatePostInCaches,
  removePostFromCaches,
  removeAuthorPostsFromFeed,
  isPostOwnedBy,
  resolveActivityActor,
  getNewPostsCount,
  formatNewPostsLabel,
  isNotFoundError,
  isPrivateAccountError,
} from './utils';
import { BackendPost, PostActivity, CursorPaginatedPostsResponse } from './types';

describe('features/posts/utils', () => {
  describe('normalizePost', () => {
    it('normalizes a basic raw Laravel post with default values', () => {
      const raw: BackendPost = {
        id: 42,
        content: 'Hello world',
        user: { id: 1, name: 'Alice' },
        likes_count: 5,
        comments_count: 2,
        created_at: '2026-10-30T10:00:00Z',
      };

      const normalized = normalizePost(raw);
      expect(normalized.id).toBe('42');
      expect(normalized.title).toBe('Alice');
      expect(normalized.author).toBe('Alice');
      expect(normalized.authorId).toBe(1);
      expect(normalized.content).toBe('Hello world');
      expect(normalized.likes).toBe('5');
      expect(normalized.comments).toBe('2');
      expect(normalized.isReposted).toBe(false);
      expect(normalized.isBookmarked).toBe(false);
      expect(normalized.bookmarked).toBe(false);
      expect(normalized.activityType).toBeUndefined();
      expect(normalized.media).toBeUndefined();
    });

    it('correctly maps is_bookmarked and bookmarked flags', () => {
      const bookmarkedRaw: BackendPost = {
        id: 99,
        content: 'Bookmarked post',
        is_bookmarked: true,
      };
      const normalized = normalizePost(bookmarkedRaw);
      expect(normalized.isBookmarked).toBe(true);
      expect(normalized.bookmarked).toBe(true);

      const altBookmarkedRaw: BackendPost = {
        id: 100,
        content: 'Alt bookmarked post',
        bookmarked: true,
      };
      const altNormalized = normalizePost(altBookmarkedRaw);
      expect(altNormalized.isBookmarked).toBe(true);
      expect(altNormalized.bookmarked).toBe(true);
    });

    it('preserves media array when present', () => {
      const raw: BackendPost = {
        id: 'post-media',
        content: 'Post with photo',
        media: [{ id: 'm-1', url: 'https://example.com/photo.jpg' }],
      };
      const normalized = normalizePost(raw);
      expect(normalized.media).toEqual([{ id: 'm-1', url: 'https://example.com/photo.jpg' }]);
      expect(normalized.imageUrl).toBe('https://example.com/photo.jpg');
    });

    it('attaches activity metadata when provided', () => {
      const raw: BackendPost = {
        id: 'post-1',
        content: 'Activity post',
        user: { id: 'u1', name: 'Author' },
      };
      const activity: PostActivity = {
        type: 'repost',
        actor: { id: 'u2', name: 'Bob Reposter' },
      };

      const normalized = normalizePost(raw, undefined, activity, 'feed-item-1');
      expect(normalized.activityType).toBe('repost');
      expect(normalized.activityActor).toBe('Bob Reposter');
      expect(normalized.feedItemId).toBe('feed-item-1');
    });
    it('resolves author avatar URL when author.profile.avatar.url is provided', () => {
      const raw: BackendPost = {
        id: 'post-with-avatar',
        content: 'Post with author avatar',
        author: {
          id: 'author-1',
          name: 'Pastor John',
          profile: {
            username: 'pastorjohn',
            avatar: {
              id: 'media-avatar',
              url: 'https://cdn.example.com/avatar.jpg',
            },
          } as any,
        },
      };

      const normalized = normalizePost(raw);
      expect(normalized.avatarUrl).toBe('https://cdn.example.com/avatar.jpg');
    });
  });

  describe('normalizeCursorPaginatedPosts', () => {
    it('normalizes paginated response with nested meta.meta.next_cursor', () => {
      const response: CursorPaginatedPostsResponse = {
        success: true,
        data: [
          {
            id: 'p-1',
            content: 'First post',
            author: { id: 'u1', name: 'User 1' },
          },
        ],
        meta: {
          meta: {
            path: 'https://api.example.com/likes',
            per_page: 15,
            next_cursor: 'cursor-abc',
            prev_cursor: null,
          },
        },
      };

      const result = normalizeCursorPaginatedPosts(response);
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].id).toBe('p-1');
      expect(result.nextCursor).toBe('cursor-abc');
    });

    it('handles flat meta.next_cursor and missing data gracefully', () => {
      const response = {
        data: null,
        meta: {
          next_cursor: 'cursor-flat',
        },
      };

      const result = normalizeCursorPaginatedPosts(response);
      expect(result.posts).toEqual([]);
      expect(result.nextCursor).toBe('cursor-flat');
    });
  });

  describe('mergeCursorPaginatedPosts', () => {
    it('replaces currentCache with newItems when cursor is falsy', () => {
      const currentCache = {
        posts: [{ id: 'p-1', title: 'Old' } as any],
        nextCursor: 'old-cursor',
      };
      const newItems = {
        posts: [{ id: 'p-2', title: 'New' } as any],
        nextCursor: 'new-cursor',
      };

      const result = mergeCursorPaginatedPosts(currentCache, newItems, null);
      expect(result).toEqual(newItems);
    });

    it('merges new items uniquely and updates nextCursor when cursor is provided', () => {
      const currentCache = {
        posts: [{ id: 'p-1', title: 'First' } as any],
        nextCursor: 'cursor-1',
      };
      const newItems = {
        posts: [
          { id: 'p-1', title: 'Duplicate First' } as any,
          { id: 'p-2', title: 'Second' } as any,
        ],
        nextCursor: 'cursor-2',
      };

      mergeCursorPaginatedPosts(currentCache, newItems, 'cursor-1');
      expect(currentCache.posts).toHaveLength(2);
      expect(currentCache.posts.map((p) => p.id)).toEqual(['p-1', 'p-2']);
      expect(currentCache.nextCursor).toBe('cursor-2');
    });
  });

  describe('isPrivateAccountError', () => {
    it('returns true when status is 403 and message mentions private', () => {
      expect(
        isPrivateAccountError({
          status: 403,
          data: { message: 'This account is private.' },
        })
      ).toBe(true);
      expect(
        isPrivateAccountError({
          status: 403,
          data: { message: 'ACCOUNT_IS_PRIVATE' },
        })
      ).toBe(true);
    });

    it('returns false for 403 with other messages', () => {
      expect(
        isPrivateAccountError({
          status: 403,
          data: { message: 'You cannot view this user\'s content.' },
        })
      ).toBe(false);
    });

    it('returns false for non-403 statuses or invalid errors', () => {
      expect(isPrivateAccountError({ status: 404 })).toBe(false);
      expect(isPrivateAccountError({ status: 401 })).toBe(false);
      expect(isPrivateAccountError(null)).toBe(false);
      expect(isPrivateAccountError('error')).toBe(false);
    });
  });

  describe('mergeUniquePosts', () => {
    it('merges new items while filtering out duplicates based on keySelector', () => {
      const current = [
        { id: '1', title: 'First' },
        { id: '2', title: 'Second' },
      ];
      const incoming = [
        { id: '2', title: 'Duplicate Second' },
        { id: '3', title: 'Third' },
      ];

      const merged = mergeUniquePosts(current, incoming, (item) => item.id);
      expect(merged).toHaveLength(3);
      expect(merged.map((m) => m.id)).toEqual(['1', '2', '3']);
      expect(merged[1].title).toBe('Second'); // keeps original
    });
  });

  describe('updatePostInCaches', () => {
    it('calls updateQueryData across getFeed, getPosts, and getPost and reverts on undo', () => {
      const undoFeed = jest.fn();
      const undoPosts = jest.fn();
      const undoSingle = jest.fn();

      const mockApi = {
        util: {
          updateQueryData: jest.fn((endpoint: string) => {
            if (endpoint === 'getFeed') return { undo: undoFeed };
            if (endpoint === 'getPosts') return { undo: undoPosts };
            return { undo: undoSingle };
          }),
        },
      };

      const dispatch = jest.fn((action: any) => action);

      const undo = updatePostInCaches(mockApi, dispatch, 'post-123', jest.fn());

      expect(mockApi.util.updateQueryData).toHaveBeenCalledWith(
        'getFeed',
        undefined,
        expect.any(Function)
      );
      expect(mockApi.util.updateQueryData).toHaveBeenCalledWith(
        'getPosts',
        undefined,
        expect.any(Function)
      );
      expect(mockApi.util.updateQueryData).toHaveBeenCalledWith(
        'getPost',
        'post-123',
        expect.any(Function)
      );

      undo();
      expect(undoFeed).toHaveBeenCalledTimes(1);
      expect(undoPosts).toHaveBeenCalledTimes(1);
      expect(undoSingle).toHaveBeenCalledTimes(1);
    });

    it('scans and updates dynamic profile queries when state is provided', () => {
      const undoCustom = jest.fn();
      const mockApi = {
        reducerPath: 'api',
        util: {
          updateQueryData: jest.fn(() => ({ undo: undoCustom })),
        },
      };

      const dispatch = jest.fn((action: any) => action);
      const mockState = {
        api: {
          queries: {
            'getLikedPosts("me")': {
              endpointName: 'getLikedPosts',
              originalArgs: undefined,
            },
            'getRepostedPosts({"userId":"u1"})': {
              endpointName: 'getRepostedPosts',
              originalArgs: { userId: 'u1' },
            },
          },
        },
      };

      const undo = updatePostInCaches(mockApi, dispatch, 'post-1', jest.fn(), mockState);
      expect(mockApi.util.updateQueryData).toHaveBeenCalledWith(
        'getLikedPosts',
        undefined,
        expect.any(Function)
      );
      expect(mockApi.util.updateQueryData).toHaveBeenCalledWith(
        'getRepostedPosts',
        { userId: 'u1' },
        expect.any(Function)
      );
      undo();
      expect(undoCustom).toHaveBeenCalled();
    });
  });

  describe('removePostFromCaches', () => {
    it('removes post from getFeed and getPosts drafts and reverts on undo', () => {
      const undoFeed = jest.fn();
      const undoPosts = jest.fn();
      const callbacks: Record<string, any> = {};

      const mockApi = {
        util: {
          updateQueryData: jest.fn((endpoint: string, args: any, callback: any) => {
            callbacks[endpoint] = callback;
            if (endpoint === 'getFeed') return { undo: undoFeed };
            return { undo: undoPosts };
          }),
        },
      };

      const dispatch = jest.fn((action: any) => action);

      const undo = removePostFromCaches(mockApi, dispatch, 'post-remove');

      expect(mockApi.util.updateQueryData).toHaveBeenCalledWith(
        'getFeed',
        undefined,
        expect.any(Function)
      );
      expect(mockApi.util.updateQueryData).toHaveBeenCalledWith(
        'getPosts',
        undefined,
        expect.any(Function)
      );

      // Verify feed draft filtering
      const feedDraft = {
        posts: [{ id: 'post-remove' }, { id: 'post-keep' }],
      };
      callbacks['getFeed'](feedDraft);
      expect(feedDraft.posts).toHaveLength(1);
      expect(feedDraft.posts[0].id).toBe('post-keep');

      // Verify posts draft filtering
      const postsDraft = [{ id: 'post-remove' }, { id: 'post-keep' }];
      const filteredPosts = callbacks['getPosts'](postsDraft);
      expect(filteredPosts).toHaveLength(1);
      expect(filteredPosts[0].id).toBe('post-keep');

      undo();
      expect(undoFeed).toHaveBeenCalledTimes(1);
      expect(undoPosts).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeAuthorPostsFromFeed', () => {
    it('removes all posts matching authorId from getFeed draft and reverts on undo', () => {
      const undoFeed = jest.fn();
      let feedCallback: any = null;

      const mockApi = {
        util: {
          updateQueryData: jest.fn((endpoint: string, args: any, callback: any) => {
            if (endpoint === 'getFeed') {
              feedCallback = callback;
              return { undo: undoFeed };
            }
            return { undo: jest.fn() };
          }),
        },
      };

      const dispatch = jest.fn((action: any) => action);

      const undo = removeAuthorPostsFromFeed(mockApi, dispatch, '123');

      expect(mockApi.util.updateQueryData).toHaveBeenCalledWith(
        'getFeed',
        undefined,
        expect.any(Function)
      );

      // Verify feed draft filtering for matching authorId (string and number comparisons)
      const feedDraft = {
        posts: [
          { id: 'post-1', authorId: '123' },
          { id: 'post-2', authorId: 'user-456' },
          { id: 'post-3', authorId: 123 },
          { id: 'post-4', authorId: 'user-789' },
        ],
      };
      feedCallback(feedDraft);
      expect(feedDraft.posts).toHaveLength(2);
      expect(feedDraft.posts.map((post: any) => post.id)).toEqual(['post-2', 'post-4']);

      undo();
      expect(undoFeed).toHaveBeenCalledTimes(1);
    });
  });

  describe('isPostOwnedBy', () => {
    it('returns true when authorId matches currentUser id (numeric or string)', () => {
      expect(isPostOwnedBy({ authorId: 42, author: 'Alice' }, { id: '42', name: 'Alice' })).toBe(true);
      expect(isPostOwnedBy({ authorId: '42', author: 'Alice' }, { id: 42, name: 'Alice' })).toBe(true);
    });

    it('returns true when author matches currentUser name', () => {
      expect(isPostOwnedBy({ authorId: 99, author: 'Alice' }, { id: 1, name: 'Alice' })).toBe(true);
    });

    it('returns false when neither authorId nor author matches', () => {
      expect(isPostOwnedBy({ authorId: 99, author: 'Bob' }, { id: 1, name: 'Alice' })).toBe(false);
    });

    it('returns false when currentUser is null or undefined or missing id', () => {
      expect(isPostOwnedBy({ authorId: 42, author: 'Alice' }, null)).toBe(false);
      expect(isPostOwnedBy({ authorId: 42, author: 'Alice' }, undefined)).toBe(false);
      expect(isPostOwnedBy({ authorId: 42, author: 'Alice' }, { name: 'Alice' })).toBe(false);
    });
  });

  describe('resolveActivityActor', () => {
    it('converts actor to "You" when actor matches current user name', () => {
      expect(resolveActivityActor('Alice', 'Alice')).toBe('You');
    });

    it('preserves other actor names unchanged', () => {
      expect(resolveActivityActor('Bob', 'Alice')).toBe('Bob');
    });

    it('returns undefined when activityActor is undefined', () => {
      expect(resolveActivityActor(undefined, 'Alice')).toBeUndefined();
    });
  });

  describe('getNewPostsCount', () => {
    it('calculates unseen count by excluding loaded post ids and takes max with catchUpCount', () => {
      const loaded = new Set(['p1', 'p2']);
      const pending = ['p1', 'p3', 'p4'];
      // unseen: p3, p4 = 2. catchUpCount: 1. max(2, 1) = 2.
      expect(getNewPostsCount(pending, 1, loaded)).toBe(2);
      // unseen: 2. catchUpCount: 5. max(2, 5) = 5.
      expect(getNewPostsCount(pending, 5, loaded)).toBe(5);
    });

    it('returns 0 when no pending and catchUpCount is 0 or negative', () => {
      expect(getNewPostsCount([], 0, new Set())).toBe(0);
      expect(getNewPostsCount([], -1, new Set())).toBe(0);
    });
  });

  describe('formatNewPostsLabel', () => {
    it('formats singular and plural labels', () => {
      expect(formatNewPostsLabel(1)).toBe('1 new post');
      expect(formatNewPostsLabel(5)).toBe('5 new posts');
    });

    it('caps large counts at 99+', () => {
      expect(formatNewPostsLabel(100)).toBe('99+ new posts');
      expect(formatNewPostsLabel(150)).toBe('99+ new posts');
    });
  });

  describe('isNotFoundError', () => {
    it('returns true when error object has status 404', () => {
      expect(isNotFoundError({ status: 404 })).toBe(true);
      expect(isNotFoundError({ status: 404, data: { message: 'Not found' } })).toBe(true);
    });

    it('returns false for other status codes', () => {
      expect(isNotFoundError({ status: 400 })).toBe(false);
      expect(isNotFoundError({ status: 401 })).toBe(false);
      expect(isNotFoundError({ status: 422 })).toBe(false);
      expect(isNotFoundError({ status: 500 })).toBe(false);
    });

    it('returns false for non-object, null, or undefined errors', () => {
      expect(isNotFoundError(null)).toBe(false);
      expect(isNotFoundError(undefined)).toBe(false);
      expect(isNotFoundError('FETCH_ERROR')).toBe(false);
      expect(isNotFoundError(123)).toBe(false);
      expect(isNotFoundError({})).toBe(false);
    });
  });
});

