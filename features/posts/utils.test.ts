import {
  normalizePost,
  mergeUniquePosts,
  updatePostInCaches,
  removePostFromCaches,
} from './utils';
import { LaravelPost, PostActivity } from './types';

describe('features/posts/utils', () => {
  describe('normalizePost', () => {
    it('normalizes a basic raw Laravel post with default values', () => {
      const raw: LaravelPost = {
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
      expect(normalized.activityType).toBeUndefined();
    });

    it('attaches activity metadata when provided', () => {
      const raw: LaravelPost = {
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
});

