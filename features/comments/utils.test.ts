import {
  normalizeComment,
  mergeCommentsCache,
  mergeCommentRepliesCache,
  updateCommentInCache,
  updateReplyInCache,
  insertCommentInCache,
  insertReplyInCache,
  incrementCommentReplyCount,
  incrementPostCommentCount,
} from './utils';
import { Comment, CommentRepliesResult, CommentsResult, LaravelComment } from './types';

describe('features/comments/utils', () => {
  describe('normalizeComment', () => {
    it('normalizes a full Laravel comment with profile and media', () => {
      const raw: LaravelComment = {
        id: 101,
        post_id: 202,
        user_id: 303,
        parent_comment_id: null,
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
        parentCommentId: null,
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

    it('normalizes a reply with parent_comment_id', () => {
      const raw: LaravelComment = {
        id: 105,
        post_id: 202,
        user_id: 305,
        parent_comment_id: 101,
        content: 'This is a reply',
        created_at: '2026-10-30T12:30:00Z',
        user: {
          id: 305,
          name: 'Reply Author',
        },
      };

      const result = normalizeComment(raw);
      expect(result.id).toBe('105');
      expect(result.parentCommentId).toBe('101');
    });

    it('normalizes a comment with string avatar via getUserAvatarUrl', () => {
      const raw: LaravelComment = {
        id: 106,
        post_id: 202,
        user_id: 306,
        content: 'Comment with string avatar',
        created_at: '2026-10-30T12:00:00Z',
        user: {
          id: 306,
          name: 'String Avatar User',
          profile: {
            avatar: 'https://example.com/direct-avatar.png' as any,
          },
        },
      };

      const result = normalizeComment(raw);
      expect(result.avatarUrl).toBe('https://example.com/direct-avatar.png');
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

  describe('mergeCommentsCache', () => {
    it('replaces comments and nextCursor when cursor is not provided (initial or refresh)', () => {
      const currentCache: CommentsResult = {
        comments: [
          {
            id: 'c1',
            postId: 'p1',
            userId: 'u1',
            author: 'A',
            username: 'a',
            body: 'Old',
            likes: 0,
            liked: false,
            replies: 0,
            createdAt: '2026-10-30T10:00:00Z',
          },
        ],
        nextCursor: 'old-cursor',
      };

      const newItems: CommentsResult = {
        comments: [
          {
            id: 'c2',
            postId: 'p1',
            userId: 'u2',
            author: 'B',
            username: 'b',
            body: 'New',
            likes: 0,
            liked: false,
            replies: 0,
            createdAt: '2026-10-30T11:00:00Z',
          },
        ],
        nextCursor: 'cursor-2',
      };

      mergeCommentsCache(currentCache, newItems);
      expect(currentCache.comments).toEqual(newItems.comments);
      expect(currentCache.nextCursor).toBe('cursor-2');
    });

    it('merges unique comments and updates nextCursor when cursor is provided (load more)', () => {
      const currentCache: CommentsResult = {
        comments: [
          {
            id: 'c1',
            postId: 'p1',
            userId: 'u1',
            author: 'A',
            username: 'a',
            body: 'First',
            likes: 0,
            liked: false,
            replies: 0,
            createdAt: '2026-10-30T10:00:00Z',
          },
        ],
        nextCursor: 'cursor-1',
      };

      const newItems: CommentsResult = {
        comments: [
          {
            id: 'c1', // duplicate
            postId: 'p1',
            userId: 'u1',
            author: 'A',
            username: 'a',
            body: 'First duplicate',
            likes: 0,
            liked: false,
            replies: 0,
            createdAt: '2026-10-30T10:00:00Z',
          },
          {
            id: 'c2', // new
            postId: 'p1',
            userId: 'u2',
            author: 'B',
            username: 'b',
            body: 'Second',
            likes: 0,
            liked: false,
            replies: 0,
            createdAt: '2026-10-30T11:00:00Z',
          },
        ],
        nextCursor: 'cursor-2',
      };

      mergeCommentsCache(currentCache, newItems, 'cursor-1');
      expect(currentCache.comments).toHaveLength(2);
      expect(currentCache.comments[0].id).toBe('c1');
      expect(currentCache.comments[1].id).toBe('c2');
      expect(currentCache.nextCursor).toBe('cursor-2');
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
        { postId: 'post-1' },
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
        { postId: 'post-1' },
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

  describe('mergeCommentRepliesCache', () => {
    it('replaces replies and nextCursor when cursor is not provided', () => {
      const currentCache: CommentRepliesResult = {
        replies: [{ id: 'old-1' } as Comment],
        nextCursor: 'old-cur',
      };
      const newItems: CommentRepliesResult = {
        replies: [{ id: 'reply-1' } as Comment, { id: 'reply-2' } as Comment],
        nextCursor: 'cursor-2',
      };

      mergeCommentRepliesCache(currentCache, newItems, null);

      expect(currentCache.replies).toHaveLength(2);
      expect(currentCache.replies[0].id).toBe('reply-1');
      expect(currentCache.nextCursor).toBe('cursor-2');
    });

    it('merges unique replies and updates nextCursor when cursor is provided (load more)', () => {
      const currentCache: CommentRepliesResult = {
        replies: [{ id: 'reply-1' } as Comment, { id: 'reply-2' } as Comment],
        nextCursor: 'cursor-1',
      };
      const newItems: CommentRepliesResult = {
        replies: [{ id: 'reply-2' } as Comment, { id: 'reply-3' } as Comment],
        nextCursor: 'cursor-2',
      };

      mergeCommentRepliesCache(currentCache, newItems, 'cursor-1');

      expect(currentCache.replies).toHaveLength(3);
      expect(currentCache.replies.map((replyItem) => replyItem.id)).toEqual(['reply-1', 'reply-2', 'reply-3']);
      expect(currentCache.nextCursor).toBe('cursor-2');
    });
  });

  describe('updateReplyInCache', () => {
    it('updates reply in getCommentReplies draft and rolls back on undo', () => {
      let updateCallback: ((draft: any) => void) | undefined;
      const undoMock = jest.fn();
      const mockApi = {
        util: {
          updateQueryData: jest.fn((endpoint: string, args: any, callback: any) => {
            updateCallback = callback;
            return { undo: undoMock };
          }),
        },
      };
      const dispatch = jest.fn((action: any) => action);

      const undo = updateReplyInCache(
        mockApi,
        dispatch,
        'parent-123',
        'reply-456',
        (reply: Comment) => {
          reply.liked = true;
          reply.likes = 10;
        }
      );

      expect(mockApi.util.updateQueryData).toHaveBeenCalledWith(
        'getCommentReplies',
        { commentId: 'parent-123' },
        expect.any(Function)
      );

      const draft = {
        replies: [
          { id: 'reply-456', liked: false, likes: 9 } as Comment,
        ],
      };
      updateCallback?.(draft);

      expect(draft.replies[0].liked).toBe(true);
      expect(draft.replies[0].likes).toBe(10);

      undo();
      expect(undoMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('insertReplyInCache', () => {
    it('appends newly created reply to the end of getCommentReplies draft', () => {
      let updateCallback: ((draft: any) => void) | undefined;
      const mockApi = {
        util: {
          updateQueryData: jest.fn((endpoint: string, args: any, callback: any) => {
            updateCallback = callback;
            return { undo: jest.fn() };
          }),
        },
      };
      const dispatch = jest.fn((action: any) => action);

      const newReply = { id: 'reply-new', body: 'New reply content' } as Comment;
      insertReplyInCache(mockApi, dispatch, 'parent-123', newReply);

      expect(mockApi.util.updateQueryData).toHaveBeenCalledWith(
        'getCommentReplies',
        { commentId: 'parent-123' },
        expect.any(Function)
      );

      const draft = {
        replies: [{ id: 'reply-old' } as Comment],
      };
      updateCallback?.(draft);

      expect(draft.replies).toHaveLength(2);
      expect(draft.replies[1].id).toBe('reply-new');
    });
  });

  describe('incrementCommentReplyCount', () => {
    it('increments replies count on the parent comment and provides rollback undo', () => {
      let updateCallback: ((draft: any) => void) | undefined;
      const undoMock = jest.fn();
      const mockApi = {
        util: {
          updateQueryData: jest.fn((endpoint: string, args: any, callback: any) => {
            updateCallback = callback;
            return { undo: undoMock };
          }),
        },
      };
      const dispatch = jest.fn((action: any) => action);

      const undo = incrementCommentReplyCount(mockApi, dispatch, 'post-456', 'comment-123');

      expect(mockApi.util.updateQueryData).toHaveBeenCalledWith(
        'getComments',
        { postId: 'post-456' },
        expect.any(Function)
      );

      const draft = {
        comments: [
          { id: 'comment-123', replies: 2 } as Comment,
          { id: 'comment-999', replies: 0 } as Comment,
        ],
      };
      updateCallback?.(draft);

      expect(draft.comments[0].replies).toBe(3);

      undo();
      expect(undoMock).toHaveBeenCalledTimes(1);
    });
  });
});
