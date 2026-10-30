import { Comment, CommentsResult, LaravelComment } from './types';
import { updatePostInCaches } from '../posts/utils';
import { Post } from '../posts/types';

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

  const avatarUrl = raw.user?.profile?.avatar?.url ?? undefined;

  return {
    id: String(raw.id),
    postId: String(raw.post_id),
    userId: raw.user_id ? String(raw.user_id) : null,
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

  const existingIds = new Set(currentCache.comments.map((c) => c.id));
  const uniqueIncoming = newItems.comments.filter((c) => !existingIds.has(c.id));
  currentCache.comments.push(...uniqueIncoming);
  currentCache.nextCursor = newItems.nextCursor;
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
        const comment = draft?.comments?.find((c: Comment) => c.id === commentId);
        if (comment) updater(comment);
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

