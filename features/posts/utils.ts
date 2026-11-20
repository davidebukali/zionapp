import { Post, BackendPost, PostActivity, CursorPaginatedPostsResponse, FeedResult } from './types';
import { getUserAvatarUrl } from '../../utils/user';

/**
 * Normalizes a raw Laravel Post model and optional activity metadata
 * into a strongly typed client Post model.
 */
export function normalizePost(
  raw: BackendPost,
  fallbackDate?: string,
  activity?: PostActivity,
  feedItemId?: string | number
): Post {
  const authorName = raw.user?.name || raw.author?.name || 'Zion Member';
  const authorId = raw.user?.id ?? raw.author?.id;
  const avatarUrl = getUserAvatarUrl(raw.user || raw.author);
  const firstMedia = raw.media && raw.media.length > 0 ? raw.media[0] : undefined;
  const imageUrl = firstMedia?.url;
  const mediaWidth = firstMedia?.width;
  const mediaHeight = firstMedia?.height;
  const createdAt = raw.created_at || fallbackDate || new Date().toISOString();
  const updatedAt = raw.updated_at || createdAt;
  const isReposted = Boolean(raw.is_reposted ?? raw.reposted ?? false);
  const repostsCount = typeof raw.reposts_count === 'number' ? raw.reposts_count : 0;
  const isBookmarked = Boolean(raw.is_bookmarked ?? raw.bookmarked ?? false);
  const activityType =
    activity?.type && activity.type !== 'post' ? activity.type : undefined;
  const activityActor = activity?.actor?.name;

  return {
    id: String(raw.id),
    title: authorName,
    content: raw.content || '',
    author: authorName,
    authorId,
    avatarUrl,
    imageUrl,
    mediaWidth,
    mediaHeight,
    media: raw.media,
    likes: typeof raw.likes_count === 'number' ? String(raw.likes_count) : '0',
    comments: typeof raw.comments_count === 'number' ? String(raw.comments_count) : '0',
    liked: Boolean(raw.is_liked ?? raw.liked ?? false),
    isReposted,
    reposted: isReposted,
    repostsCount,
    isBookmarked,
    bookmarked: isBookmarked,
    activityType,
    activityActor,
    activity,
    feedItemId,
    createdAt,
    updatedAt,
  };
}

/**
 * Normalizes a cursor-paginated posts API response envelope into FeedResult.
 */
export function normalizeCursorPaginatedPosts(
  response: CursorPaginatedPostsResponse | any
): FeedResult {
  const items = Array.isArray(response?.data) ? response.data : [];
  return {
    posts: items.map((item: any) => {
      const rawPost = item.post || item;
      const publishedAt = item.published_at || rawPost.created_at;
      return normalizePost(rawPost, publishedAt);
    }),
    nextCursor:
      response?.meta?.meta?.next_cursor ??
      response?.meta?.next_cursor ??
      null,
  };
}

/**
 * Merges cursor-paginated posts into an existing cache.
 * When cursor is null or undefined, replaces cache (initial load or refresh).
 * When cursor is present, appends unique posts.
 */
export function mergeCursorPaginatedPosts(
  currentCache: FeedResult,
  newItems: FeedResult,
  cursor?: string | null
): FeedResult | void {
  if (!cursor) {
    return newItems;
  }
  currentCache.posts = mergeUniquePosts(
    currentCache.posts,
    newItems.posts,
    (post) => post.id
  );
  currentCache.nextCursor = newItems.nextCursor;
}

/**
 * Detects whether an API or RTK Query error is a 403 Forbidden private account error.
 */
export function isPrivateAccountError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return false;
  }
  const status = (error as { status?: unknown }).status;
  if (status !== 403) {
    return false;
  }
  const message = String(
    (error as { data?: { message?: string } })?.data?.message || ''
  ).toLowerCase();
  return message.includes('private');
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
  updater: (post: Post) => void,
  state?: unknown
): () => void {
  const undos: Array<() => void> = [];

  // 1. Patch personalized feed cache (may contain multiple items for same post)
  const patchFeed = dispatch(
    api.util.updateQueryData('getFeed', undefined as any, (draft: any) => {
      draft?.posts?.forEach((p: Post) => {
        if (p.id === postId) updater(p);
      });
    })
  );
  if (patchFeed?.undo) undos.push(patchFeed.undo);

  // 2. Patch public posts cache (used as fallback when feed is empty)
  const patchPosts = dispatch(
    api.util.updateQueryData('getPosts', undefined as any, (draft: any) => {
      if (!Array.isArray(draft)) return;
      draft.forEach((p: Post) => {
        if (p.id === postId) updater(p);
      });
    })
  );
  if (patchPosts?.undo) undos.push(patchPosts.undo);

  // 3. Patch single post detail cache (if currently open)
  const patchSingle = dispatch(
    api.util.updateQueryData('getPost', postId, (draft: any) => {
      if (draft) updater(draft);
    })
  );
  if (patchSingle?.undo) undos.push(patchSingle.undo);

  // 4. Scan active dynamic user-scoped and profile queries if state provided
  if (state && typeof state === 'object') {
    const reducerPath = api?.reducerPath || 'api';
    const apiState = (state as Record<string, any>)?.[reducerPath];
    const queries = apiState?.queries;
    if (queries && typeof queries === 'object') {
      const handledKeys = new Set<string>();
      Object.keys(queries).forEach((queryKey) => {
        const queryEntry = queries[queryKey];
        const endpointName = queryEntry?.endpointName;
        if (
          endpointName &&
          ['getLikedPosts', 'getRepostedPosts', 'getBookmarkedPosts', 'getUserPosts'].includes(endpointName)
        ) {
          const serializedKey = `${endpointName}:${JSON.stringify(queryEntry.originalArgs ?? null)}`;
          if (!handledKeys.has(serializedKey)) {
            handledKeys.add(serializedKey);
            const patch = dispatch(
              api.util.updateQueryData(endpointName, queryEntry.originalArgs, (draft: any) => {
                if (draft?.posts && Array.isArray(draft.posts)) {
                  draft.posts.forEach((p: Post) => {
                    if (p.id === postId) updater(p);
                  });
                }
              })
            );
            if (patch?.undo) undos.push(patch.undo);
          }
        }
      });
    }
  }

  return () => {
    [...undos].reverse().forEach((undo) => undo());
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

/**
 * Optimistically removes a post from active RTK Query caches (getFeed, getPosts, and active profile feeds).
 * Returns an undo function that restores previous cache states if deletion fails.
 */
export function removePostFromCaches(
  api: any,
  dispatch: any,
  postId: string,
  state?: unknown
): () => void {
  const undos: Array<() => void> = [];

  const patchFeed = dispatch(
    api.util.updateQueryData('getFeed', undefined as any, (draft: any) => {
      if (draft?.posts) {
        draft.posts = draft.posts.filter((p: Post) => p.id !== postId);
      }
    })
  );
  if (patchFeed?.undo) undos.push(patchFeed.undo);

  const patchPosts = dispatch(
    api.util.updateQueryData('getPosts', undefined as any, (draft: any) => {
      if (Array.isArray(draft)) {
        return draft.filter((p: Post) => p.id !== postId);
      }
    })
  );
  if (patchPosts?.undo) undos.push(patchPosts.undo);

  if (state && typeof state === 'object') {
    const reducerPath = api?.reducerPath || 'api';
    const apiState = (state as Record<string, any>)?.[reducerPath];
    const queries = apiState?.queries;
    if (queries && typeof queries === 'object') {
      const handledKeys = new Set<string>();
      Object.keys(queries).forEach((queryKey) => {
        const queryEntry = queries[queryKey];
        const endpointName = queryEntry?.endpointName;
        if (
          endpointName &&
          ['getLikedPosts', 'getRepostedPosts', 'getBookmarkedPosts', 'getUserPosts'].includes(endpointName)
        ) {
          const serializedKey = `${endpointName}:${JSON.stringify(queryEntry.originalArgs ?? null)}`;
          if (!handledKeys.has(serializedKey)) {
            handledKeys.add(serializedKey);
            const patch = dispatch(
              api.util.updateQueryData(endpointName, queryEntry.originalArgs, (draft: any) => {
                if (draft?.posts && Array.isArray(draft.posts)) {
                  draft.posts = draft.posts.filter((p: Post) => p.id !== postId);
                }
              })
            );
            if (patch?.undo) undos.push(patch.undo);
          }
        }
      });
    }
  }

  return () => {
    [...undos].reverse().forEach((undo) => undo());
  };
}

/**
 * Optimistically removes all posts by a specific author from the active feed cache (getFeed).
 * Returns an undo function that restores previous cache states if the unfollow request fails.
 */
export function removeAuthorPostsFromFeed(
  api: any,
  dispatch: any,
  authorId: string | number
): () => void {
  const patchFeed = dispatch(
    api.util.updateQueryData('getFeed', undefined as any, (draft: any) => {
      if (draft?.posts) {
        draft.posts = draft.posts.filter(
          (existingPost: Post) => String(existingPost.authorId) !== String(authorId)
        );
      }
    })
  );

  return () => {
    patchFeed.undo();
  };
}

/**
 * Checks whether a post is owned by the current authenticated user.
 */
export function isPostOwnedBy(
  post: Pick<Post, "authorId" | "author">,
  currentUser?: { id?: string | number; name?: string } | null
): boolean {
  if (!currentUser?.id) {
    return false;
  }
  return (
    String(post.authorId) === String(currentUser.id) ||
    post.author === currentUser.name
  );
}

/**
 * Resolves the actor display label, converting the user's own actions to "You".
 */
export function resolveActivityActor(
  activityActor: string | undefined,
  currentUserName?: string
): string | undefined {
  if (activityActor && currentUserName && activityActor === currentUserName) {
    return "You";
  }
  return activityActor;
}

/**
 * Calculates the number of unseen new posts by filtering out already loaded posts
 * and taking the maximum between real-time pending count and server catch-up count.
 */
export function getNewPostsCount(
  pendingPostIds: string[],
  catchUpCount: number,
  loadedPostIds: Set<string>
): number {
  const unseenCount = pendingPostIds.filter(
    (postId) => !loadedPostIds.has(postId)
  ).length;
  return Math.max(unseenCount, Math.max(0, catchUpCount));
}

/**
 * Formats the badge label for the new posts indicator pill.
 */
export function formatNewPostsLabel(count: number): string {
  if (count === 1) {
    return "1 new post";
  }
  return `${count > 99 ? "99+" : count} new posts`;
}

/**
 * Returns true when an RTK Query or API error has an HTTP 404 status (e.g. post was deleted).
 */
export function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status?: unknown }).status === 404
  );
}


