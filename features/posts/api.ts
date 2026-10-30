import { baseApi } from '../../services/baseApi';
import {
  Post,
  FeedResult,
  FeedResponse,
  PostsListResponse,
  normalizePost,
  LaravelPost,
  UploadUrlRequest,
  UploadUrlResponse,
  ConfirmMediaRequest,
  ConfirmMediaResponse,
  CreatePostRequest,
  CreatePostResponse,
  MediaStatusResponse,
  RepostResponse,
} from './types';

// ============================================================================
// Cache Helper: Synchronize Post Changes Across Feeds & Detail Caches
// ============================================================================

/**
 * Optimistically updates a post across all active RTK Query caches
 * (feed list, public posts list, and single post query).
 *
 * Returns an undo function that reverts all patched caches if an API call fails.
 */
function updatePostInCaches(
  dispatch: any,
  postId: string,
  updater: (post: Post) => void
): () => void {
  // 1. Patch personalized feed cache (may contain multiple items for same post)
  const patchFeed = dispatch(
    postsApi.util.updateQueryData('getFeed', undefined as any, (draft) => {
      draft?.posts?.forEach((p) => {
        if (p.id === postId) updater(p);
      });
    })
  );

  // 2. Patch public posts cache (used as fallback when feed is empty)
  const patchPosts = dispatch(
    postsApi.util.updateQueryData('getPosts', undefined as any, (draft) => {
      if (!Array.isArray(draft)) return;
      draft.forEach((p) => {
        if (p.id === postId) updater(p);
      });
    })
  );

  // 3. Patch single post detail cache (if currently open)
  const patchSingle = dispatch(
    postsApi.util.updateQueryData('getPost', postId, (draft) => {
      if (draft) updater(draft);
    })
  );

  return () => {
    patchFeed.undo();
    patchPosts.undo();
    patchSingle.undo();
  };
}

// ============================================================================
// Posts API Slice Endpoints
// ============================================================================

export const postsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ------------------------------------------------------------------------
    // Queries
    // ------------------------------------------------------------------------

    /**
     * Personalized Home Feed with cursor-based pagination.
     */
    getFeed: builder.query<FeedResult, { cursor?: string; perPage?: number } | void>({
      query: (arg) => ({
        url: '/feed',
        params: {
          per_page: arg?.perPage ?? 20,
          cursor: arg?.cursor,
        },
      }),
      transformResponse: (response: FeedResponse): FeedResult => {
        const items = response?.data || [];
        return {
          posts: items.map((item) => {
            const hasActivity = Boolean(
              item.type && item.type !== 'post' && item.actor
            );
            return normalizePost(
              item.post,
              item.published_at,
              hasActivity
                ? {
                    type: item.type!,
                    actor: item.actor!,
                    publishedAt: item.published_at,
                  }
                : undefined,
              item.id
            );
          }),
          nextCursor: response?.meta?.next_cursor ?? null,
        };
      },
      serializeQueryArgs: ({ endpointName }) => endpointName,
      // Merge subsequent pages into existing feed without duplicating item IDs
      merge: (currentCache, newItems, { arg }) => {
        if (!arg?.cursor) {
          return newItems;
        }
        const existingIds = new Set(
          currentCache.posts.map((p) => String(p.feedItemId || p.id))
        );
        const filtered = newItems.posts.filter(
          (p) => !existingIds.has(String(p.feedItemId || p.id))
        );
        currentCache.posts.push(...filtered);
        currentCache.nextCursor = newItems.nextCursor;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.cursor !== previousArg?.cursor,
      providesTags: (result) =>
        result
          ? [
              ...result.posts.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Feed', id: 'LIST' },
            ]
          : [{ type: 'Feed', id: 'LIST' }],
    }),

    /**
     * Public Posts Feed with offset-based pagination.
     */
    getPosts: builder.query<Post[], { page?: number; limit?: number } | void>({
      query: (arg) => ({
        url: '/posts',
        params: {
          page: arg?.page ?? 1,
          per_page: arg?.limit ?? 15,
        },
      }),
      transformResponse: (response: PostsListResponse | LaravelPost[] | any): Post[] => {
        const rawPosts = Array.isArray(response)
          ? response
          : (response?.data || response?.resource || []);
        return rawPosts.map((p: LaravelPost) => normalizePost(p));
      },
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems, { arg }) => {
        if ((arg?.page ?? 1) === 1) {
          return newItems;
        }
        const existingIds = new Set(currentCache.map((p) => p.id));
        const filtered = newItems.filter((p) => !existingIds.has(p.id));
        return [...currentCache, ...filtered];
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        (currentArg?.page ?? 1) !== (previousArg?.page ?? 1),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Post', id: 'LIST' },
            ]
          : [{ type: 'Post', id: 'LIST' }],
    }),

    /**
     * Fetch single post by ID.
     */
    getPost: builder.query<Post, string>({
      query: (postId) => `/posts/${postId}`,
      transformResponse: (response: any) =>
        normalizePost(response?.data || response?.resource || response),
      providesTags: (_result, _error, postId) => [{ type: 'Post', id: postId }],
    }),

    // ------------------------------------------------------------------------
    // Micro-Interactions (Optimistic Updates, No Tag Invalidation)
    // ------------------------------------------------------------------------

    /**
     * Toggle like status on a post with instant optimistic feedback.
     */
    toggleLikePost: builder.mutation<
      { success: boolean; message?: string },
      { postId: string; liked: boolean; likes?: string }
    >({
      query: ({ postId, liked }) => ({
        url: `/posts/${postId}/like`,
        method: liked ? 'DELETE' : 'POST',
      }),
      async onQueryStarted({ postId, liked }, { dispatch, queryFulfilled }) {
        const nextLiked = !liked;

        // Optimistically flip liked boolean and adjust like counter
        const undo = updatePostInCaches(dispatch, postId, (post) => {
          post.liked = nextLiked;
          const current = parseInt(post.likes || '0', 10) || 0;
          post.likes = String(nextLiked ? current + 1 : Math.max(0, current - 1));
        });

        try {
          await queryFulfilled;
        } catch {
          // Roll back optimistic cache changes if server request fails
          undo();
        }
      },
    }),

    /**
     * Toggle repost status on a post with instant optimistic feedback.
     */
    toggleRepostPost: builder.mutation<
      RepostResponse,
      { postId: string; reposted: boolean }
    >({
      query: ({ postId, reposted }) => ({
        url: `/posts/${postId}/repost`,
        method: reposted ? 'DELETE' : 'POST',
      }),
      async onQueryStarted({ postId, reposted }, { dispatch, queryFulfilled }) {
        const nextReposted = !reposted;

        const undo = updatePostInCaches(dispatch, postId, (post) => {
          post.isReposted = nextReposted;
          post.reposted = nextReposted;
          const current = post.repostsCount ?? 0;
          post.repostsCount = nextReposted ? current + 1 : Math.max(0, current - 1);
        });

        try {
          await queryFulfilled;
        } catch {
          undo();
        }
      },
    }),

    /**
     * Direct Repost mutation.
     */
    repostPost: builder.mutation<RepostResponse, string>({
      query: (postId) => ({
        url: `/posts/${postId}/repost`,
        method: 'POST',
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        const undo = updatePostInCaches(dispatch, postId, (post) => {
          post.isReposted = true;
          post.reposted = true;
          post.repostsCount = (post.repostsCount ?? 0) + 1;
        });

        try {
          await queryFulfilled;
        } catch {
          undo();
        }
      },
    }),

    /**
     * Direct Undo Repost mutation.
     */
    unrepostPost: builder.mutation<RepostResponse, string>({
      query: (postId) => ({
        url: `/posts/${postId}/repost`,
        method: 'DELETE',
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        const undo = updatePostInCaches(dispatch, postId, (post) => {
          post.isReposted = false;
          post.reposted = false;
          post.repostsCount = Math.max(0, (post.repostsCount ?? 0) - 1);
        });

        try {
          await queryFulfilled;
        } catch {
          undo();
        }
      },
    }),

    // ------------------------------------------------------------------------
    // Post Publishing & Media Upload Pipeline
    // ------------------------------------------------------------------------

    /**
     * Step 1: Request pre-signed direct upload URL for media attachment.
     */
    getMediaUploadUrl: builder.mutation<UploadUrlResponse, UploadUrlRequest>({
      query: (body) => ({
        url: '/media/upload-url',
        method: 'POST',
        body,
      }),
    }),

    /**
     * Step 2: Confirm storage upload completion (backend verifies R2/S3 ETag automatically).
     */
    confirmMediaUpload: builder.mutation<ConfirmMediaResponse, ConfirmMediaRequest>({
      query: ({ mediaId, checksum }) => ({
        url: `/media/${mediaId}/confirm`,
        method: 'POST',
        body: checksum ? { checksum } : {},
      }),
    }),

    /**
     * Step 3: Fetch media status to verify background processing (variants generation) is complete.
     */
    getMediaStatus: builder.query<MediaStatusResponse, string>({
      query: (mediaId) => ({
        url: `/media/${mediaId}`,
        method: 'GET',
      }),
    }),

    /**
     * Step 4: Create post with content and confirmed media IDs.
     * Invalidates Feed and Post lists so newly published post appears at top.
     */
    createPost: builder.mutation<Post, CreatePostRequest>({
      query: (body) => ({
        url: '/posts',
        method: 'POST',
        body,
      }),
      transformResponse: (response: CreatePostResponse | any): Post =>
        normalizePost(response?.data || response),
      invalidatesTags: [
        { type: 'Feed', id: 'LIST' },
        { type: 'Post', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: true,
});

// ============================================================================
// Auto-Generated React Hooks
// ============================================================================

export const {
  useGetFeedQuery,
  useGetPostsQuery,
  useGetPostQuery,
  useToggleLikePostMutation,
  useToggleRepostPostMutation,
  useRepostPostMutation,
  useUnrepostPostMutation,
  useGetMediaUploadUrlMutation,
  useConfirmMediaUploadMutation,
  useGetMediaStatusQuery,
  useLazyGetMediaStatusQuery,
  useCreatePostMutation,
} = postsApi;
