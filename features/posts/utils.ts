import { Post, LaravelPost, PostActivity } from './types';

/**
 * Normalizes a raw Laravel Post model and optional activity metadata
 * into a strongly typed client Post model.
 */
export function normalizePost(
  raw: LaravelPost,
  fallbackDate?: string,
  activity?: PostActivity,
  feedItemId?: string | number
): Post {
  const authorName = raw.user?.name || raw.author?.name || 'Zion Member';
  const authorId = raw.user?.id ?? raw.author?.id;
  const firstMedia = raw.media && raw.media.length > 0 ? raw.media[0] : undefined;
  const imageUrl = firstMedia?.url;
  const mediaWidth = firstMedia?.width;
  const mediaHeight = firstMedia?.height;
  const createdAt = raw.created_at || fallbackDate || new Date().toISOString();
  const updatedAt = raw.updated_at || createdAt;
  const isReposted = Boolean(raw.is_reposted ?? raw.reposted ?? false);
  const repostsCount = typeof raw.reposts_count === 'number' ? raw.reposts_count : 0;
  const activityType =
    activity?.type && activity.type !== 'post' ? activity.type : undefined;
  const activityActor = activity?.actor?.name;

  return {
    id: String(raw.id),
    title: authorName,
    content: raw.content || '',
    author: authorName,
    authorId,
    avatarUrl: undefined,
    imageUrl,
    mediaWidth,
    mediaHeight,
    likes: typeof raw.likes_count === 'number' ? String(raw.likes_count) : '0',
    comments: typeof raw.comments_count === 'number' ? String(raw.comments_count) : '0',
    liked: Boolean(raw.is_liked ?? raw.liked ?? false),
    isReposted,
    reposted: isReposted,
    repostsCount,
    activityType,
    activityActor,
    activity,
    feedItemId,
    createdAt,
    updatedAt,
  };
}

/**
 * Optimistically updates a post across all active RTK Query caches.
 * Uses Dependency Injection for the api slice to avoid circular dependencies.
 *
 * Returns an undo function that reverts all patched caches if an API call fails.
 */
export function updatePostInCaches(
  api: any,
  dispatch: any,
  postId: string,
  updater: (post: Post) => void
): () => void {
  // 1. Patch personalized feed cache (may contain multiple items for same post)
  const patchFeed = dispatch(
    api.util.updateQueryData('getFeed', undefined as any, (draft: any) => {
      draft?.posts?.forEach((p: Post) => {
        if (p.id === postId) updater(p);
      });
    })
  );

  // 2. Patch public posts cache (used as fallback when feed is empty)
  const patchPosts = dispatch(
    api.util.updateQueryData('getPosts', undefined as any, (draft: any) => {
      if (!Array.isArray(draft)) return;
      draft.forEach((p: Post) => {
        if (p.id === postId) updater(p);
      });
    })
  );

  // 3. Patch single post detail cache (if currently open)
  const patchSingle = dispatch(
    api.util.updateQueryData('getPost', postId, (draft: any) => {
      if (draft) updater(draft);
    })
  );

  return () => {
    patchFeed.undo();
    patchPosts.undo();
    patchSingle.undo();
  };
}

/**
 * Deduplicates and merges new items into an existing array based on a unique key.
 */
export function mergeUniquePosts<T>(
  currentList: T[],
  newList: T[],
  keySelector: (item: T) => string | number
): T[] {
  const existingKeys = new Set(currentList.map(keySelector));
  const uniqueIncoming = newList.filter((item) => !existingKeys.has(keySelector(item)));
  return [...currentList, ...uniqueIncoming];
}

