import { Comment, CommentRepliesResult, CommentsResult, LaravelComment } from './types';
import { updatePostInCaches } from '../posts/utils';
import { Post } from '../posts/types';
import { getUserAvatarUrl } from '../../utils/user';

/**
 * Normalizes a raw Laravel comment into a strongly typed client Comment model.
 */
export function normalizeComment(raw: LaravelComment): Comment {
  const authorName =
    raw.user?.profile?.display_name ||
    raw.user?.name ||
    (raw.user_id ? 'Member' : 'Deleted User');

  const username =
    raw.user?.profile?.username ||
    (raw.user?.name
      ? raw.user.name.toLowerCase().replace(/\s+/g, '')
      : 'member');

  const avatarUrl = getUserAvatarUrl(raw.user);

  return {
    id: String(raw.id),
    postId: String(raw.post_id),
    userId: raw.user_id ? String(raw.user_id) : null,
    parentCommentId: raw.parent_comment_id ? String(raw.parent_comment_id) : null,
    author: authorName,
    username,
    body: raw.content || '',
    avatarUrl,
    likes: typeof raw.likes_count === 'number' ? raw.likes_count : 0,
    liked: Boolean(raw.is_liked ?? false),
    replies: typeof raw.replies_count === 'number' ? raw.replies_count : 0,
    createdAt: raw.created_at || new Date().toISOString(),
  };
}

/**
 * Merges paginated comments results into the active RTK Query cache draft.
 * If cursor is falsy, replaces the comments cache (initial load or refresh).
 * If cursor is present, appends unique comments by id and updates nextCursor.
 */
export function mergeCommentsCache(
  currentCache: CommentsResult,
  newItems: CommentsResult,
  cursor?: string | null
): void {
  if (!cursor) {
    currentCache.comments = newItems.comments;
    currentCache.nextCursor = newItems.nextCursor;
    return;
  }

  const existingIds = new Set(currentCache.comments.map((commentItem) => commentItem.id));
  const uniqueIncoming = newItems.comments.filter((commentItem) => !existingIds.has(commentItem.id));
  currentCache.comments.push(...uniqueIncoming);
  currentCache.nextCursor = newItems.nextCursor;
}

/**
 * Merges paginated replies into the active getCommentReplies cache draft.
 * Replies are ordered chronological/oldest first, so additional pages append to the end.
 */
export function mergeCommentRepliesCache(
  currentCache: CommentRepliesResult,
  newItems: CommentRepliesResult,
  cursor?: string | null
): void {
  if (!cursor) {
    currentCache.replies = newItems.replies;
    currentCache.nextCursor = newItems.nextCursor;
    return;
  }

  const existingIds = new Set(currentCache.replies.map((replyItem) => replyItem.id));
  const uniqueIncoming = newItems.replies.filter((replyItem) => !existingIds.has(replyItem.id));
  currentCache.replies.push(...uniqueIncoming);
  currentCache.nextCursor = newItems.nextCursor;
}

/**
 * Optimistically updates a reply in the active getCommentReplies cache.
 * Returns an undo function to rollback if the mutation fails.
 */
export function updateReplyInCache(
  api: any,
  dispatch: any,
  parentCommentId: string,
  replyId: string,
  updater: (reply: Comment) => void
): () => void {
  const patchResult = dispatch(
    api.util.updateQueryData(
      'getCommentReplies',
      { commentId: parentCommentId } as any,
      (draft: any) => {
        const targetReply = draft?.replies?.find((replyItem: Comment) => replyItem.id === replyId);
        if (targetReply) updater(targetReply);
      }
    )
  );

  return () => {
    patchResult.undo();
  };
}

/**
 * Optimistically updates a comment in the active getComments cache.
 * Returns an undo function to rollback if the mutation fails.
 */
export function updateCommentInCache(
  api: any,
  dispatch: any,
  postId: string,
  commentId: string,
  updater: (comment: Comment) => void
): () => void {
  const patchResult = dispatch(
    api.util.updateQueryData(
      'getComments',
      { postId } as any,
      (draft: any) => {
        const targetComment = draft?.comments?.find((commentItem: Comment) => commentItem.id === commentId);
        if (targetComment) updater(targetComment);
      }
    )
  );

  return () => {
    patchResult.undo();
  };
}

/**
 * Inserts a newly created comment at the top of the getComments cache.
 */
export function insertCommentInCache(
  api: any,
  dispatch: any,
  postId: string,
  newComment: Comment
): void {
  dispatch(
    api.util.updateQueryData(
      'getComments',
      { postId } as any,
      (draft: any) => {
        if (draft && draft.comments) {
          draft.comments.unshift(newComment);
        }
      }
    )
  );
}

/**
 * Inserts a newly created reply at the end of the getCommentReplies cache (chronological order).
 */
export function insertReplyInCache(
  api: any,
  dispatch: any,
  commentId: string,
  newReply: Comment
): void {
  dispatch(
    api.util.updateQueryData(
      'getCommentReplies',
      { commentId } as any,
      (draft: any) => {
        if (draft && draft.replies) {
          draft.replies.push(newReply);
        }
      }
    )
  );
}

/**
 * Optimistically increments reply count on the parent comment in the getComments cache.
 */
export function incrementCommentReplyCount(
  api: any,
  dispatch: any,
  postId: string,
  commentId: string
): () => void {
  return updateCommentInCache(api, dispatch, postId, commentId, (targetComment: Comment) => {
    targetComment.replies = (targetComment.replies || 0) + 1;
  });
}

/**
 * Optimistically increments post comment count across all active post caches.
 * Reuses updatePostInCaches from features/posts/utils (Option A).
 */
export function incrementPostCommentCount(
  postsApi: any,
  dispatch: any,
  postId: string
): () => void {
  return updatePostInCaches(postsApi, dispatch, postId, (post: Post) => {
    const current = parseInt(post.comments || '0', 10) || 0;
    post.comments = String(current + 1);
  });
}

