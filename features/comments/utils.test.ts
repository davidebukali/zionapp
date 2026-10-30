import {
  normalizeComment,
  updateCommentInCache,
  insertCommentInCache,
  incrementPostCommentCount,
} from './utils';
import { LaravelComment } from './types';

describe('features/comments/utils', () => {
  describe('normalizeComment', () => {
    it('normalizes a full Laravel comment with profile and media', () => {
      const raw: LaravelComment = {
        id: 101,
        post_id: 202,
        user_id: 303,
        content: 'This is a test comment',
        likes_count: 7,
        is_liked: true,
        replies_count: 3,
        created_at: '2026-10-30T12:00:00Z',
        user: {
          id: 303,
          name: 'Jane Doe',
          profile: {
            display_name: 'Jane D.',
            username: 'janedoe',
            avatar: {
              url: 'https://example.com/avatar.jpg',
            },
          },
        },
      };

      const result = normalizeComment(raw);
      expect(result).toEqual({
        id: '101',
        postId: '202',
        userId: '303',
        author: 'Jane D.',
        username: 'janedoe',
        body: 'This is a test comment',
        avatarUrl: 'https://example.com/avatar.jpg',
        likes: 7,
        liked: true,
        replies: 3,
        createdAt: '2026-10-30T12:00:00Z',
      });
    });

    it('falls back gracefully when user profile is missing', () => {
      const raw: LaravelComment = {
        id: 102,
        post_id: 202,
        user_id: 304,
        content: 'Simple comment',
        created_at: '2026-10-30T12:00:00Z',
        user: {
          id: 304,
          name: 'John Smith',
        },
      };

      const result = normalizeComment(raw);
      expect(result.author).toBe('John Smith');
      expect(result.username).toBe('johnsmith');
      expect(result.avatarUrl).toBeUndefined();
      expect(result.likes).toBe(0);
      expect(result.liked).toBe(false);
      expect(result.replies).toBe(0);
    });

    it('handles deleted user fallback', () => {
      const rawWithUserId: LaravelComment = {
        id: 103,
        post_id: 202,
        user_id: 999,
        content: 'Ghost comment',
        created_at: '2026-10-30T12:00:00Z',
      };
      const resultWithUserId = normalizeComment(rawWithUserId);
      expect(resultWithUserId.author).toBe('Member');
      expect(resultWithUserId.username).toBe('member');

      const rawDeleted: LaravelComment = {
        id: 104,
        post_id: 202,
        content: 'Anon comment',
        created_at: '2026-10-30T12:00:00Z',
      };
      const resultDeleted = normalizeComment(rawDeleted);
      expect(resultDeleted.author).toBe('Deleted User');
      expect(resultDeleted.username).toBe('member');
      expect(resultDeleted.userId).toBeNull();
    });
  });

  describe('updateCommentInCache', () => {
    it('updates comment in getComments draft and rolls back on undo', () => {
      const undoMock = jest.fn();
      let draftCallback: any;

      const mockApi = {
        util: {
          updateQueryData: jest.fn((endpoint: string, args: any, callback: any) => {
            draftCallback = callback;
            return { undo: undoMock };
          }),
        },
      };
      const dispatch = jest.fn((action: any) => action);

      const undo = updateCommentInCache(mockApi, dispatch, 'post-1', 'comment-42', (comment) => {
        comment.liked = true;
        comment.likes += 1;
      });

      expect(mockApi.util.updateQueryData).toHaveBeenCalledWith(
        'getComments',
        { postId: 'post-1', cursor: undefined, perPage: 15 },
        expect.any(Function)
      );

      // Verify draft mutation
      const draft = {
        comments: [
          { id: 'comment-42', liked: false, likes: 0 },
          { id: 'comment-43', liked: false, likes: 5 },
        ],
      };
      draftCallback(draft);
      expect(draft.comments[0].liked).toBe(true);
      expect(draft.comments[0].likes).toBe(1);
      expect(draft.comments[1].likes).toBe(5);

      undo();
      expect(undoMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('insertCommentInCache', () => {
    it('unshifts newly created comment into getComments draft', () => {
      let draftCallback: any;

      const mockApi = {
        util: {
          updateQueryData: jest.fn((endpoint: string, args: any, callback: any) => {
            draftCallback = callback;
            return {};
          }),
        },
      };
      const dispatch = jest.fn((action: any) => action);

      const newComment = {
        id: 'new-1',
        postId: 'post-1',
        userId: 'u1',
        author: 'Tester',
        username: 'tester',
        body: 'New comment',
        likes: 0,
        liked: false,
        replies: 0,
        createdAt: '2026-10-30T12:00:00Z',
      };

      insertCommentInCache(mockApi, dispatch, 'post-1', newComment);

      expect(mockApi.util.updateQueryData).toHaveBeenCalledWith(
        'getComments',
        { postId: 'post-1', cursor: undefined, perPage: 15 },
        expect.any(Function)
      );

      const draft = {
        comments: [{ id: 'old-1' }],
      };
      draftCallback(draft);
      expect(draft.comments[0].id).toBe('new-1');
      expect(draft.comments).toHaveLength(2);
    });
  });

  describe('incrementPostCommentCount', () => {
    it('updates post comment count via updatePostInCaches and returns undo', () => {
      const undoFeed = jest.fn();
      const undoPosts = jest.fn();
      const undoSingle = jest.fn();
      const callbacks: Record<string, any> = {};

      const mockPostsApi = {
        util: {
          updateQueryData: jest.fn((endpoint: string, args: any, callback: any) => {
            callbacks[endpoint] = callback;
            if (endpoint === 'getFeed') return { undo: undoFeed };
            if (endpoint === 'getPosts') return { undo: undoPosts };
            return { undo: undoSingle };
          }),
        },
      };
      const dispatch = jest.fn((action: any) => action);

      const undo = incrementPostCommentCount(mockPostsApi, dispatch, 'post-99');

      expect(mockPostsApi.util.updateQueryData).toHaveBeenCalledWith(
        'getFeed',
        undefined,
        expect.any(Function)
      );
      expect(mockPostsApi.util.updateQueryData).toHaveBeenCalledWith(
        'getPost',
        'post-99',
        expect.any(Function)
      );

      // Verify post draft mutation
      const postDraft = { id: 'post-99', comments: '5' };
      callbacks['getPost'](postDraft);
      expect(postDraft.comments).toBe('6');

      undo();
      expect(undoFeed).toHaveBeenCalledTimes(1);
      expect(undoPosts).toHaveBeenCalledTimes(1);
      expect(undoSingle).toHaveBeenCalledTimes(1);
    });
  });
});
