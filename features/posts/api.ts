import { baseApi } from '../../services/baseApi';
import {
  Post,
  FeedResult,
  FeedResponse,
  PostsListResponse,
  normalizePost,
  LaravelPost,
} from './types';

export const postsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeed: builder.query<FeedResult, { cursor?: string; perPage?: number } | void>({
      query: (arg) => {
        const cursor = arg && 'cursor' in arg ? arg.cursor : undefined;
        const perPage = arg && 'perPage' in arg && arg.perPage ? arg.perPage : 20;
        const queryParams = new URLSearchParams();
        queryParams.append('per_page', String(perPage));
        if (cursor) {
          queryParams.append('cursor', cursor);
        }
        return `/feed?${queryParams.toString()}`;
      },
      transformResponse: (response: FeedResponse): FeedResult => {
        const items = response?.data || [];
        const posts = items.map((item) => normalizePost(item.post, item.published_at));
        return {
          posts,
          nextCursor: response?.meta?.next_cursor ?? null,
        };
      },
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems, { arg }) => {
        const cursor = arg && 'cursor' in arg ? arg.cursor : undefined;
        if (!cursor) {
          return newItems;
        }
        const existingIds = new Set(currentCache.posts.map((p) => p.id));
        const filteredNewItems = newItems.posts.filter((p) => !existingIds.has(p.id));
        currentCache.posts.push(...filteredNewItems);
        currentCache.nextCursor = newItems.nextCursor;
      },
      forceRefetch({ currentArg, previousArg }) {
        const currentCursor = currentArg && 'cursor' in currentArg ? currentArg.cursor : undefined;
        const previousCursor = previousArg && 'cursor' in previousArg ? previousArg.cursor : undefined;
        return currentCursor !== previousCursor;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.posts.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Feed', id: 'LIST' },
            ]
          : [{ type: 'Feed', id: 'LIST' }],
    }),

    getPosts: builder.query<Post[], { page?: number; limit?: number } | void>({
      query: (arg) => {
        const page = arg && 'page' in arg && arg.page ? arg.page : 1;
        const limit = arg && 'limit' in arg && arg.limit ? arg.limit : 15;
        return `/posts?page=${page}&per_page=${limit}`;
      },
      transformResponse: (response: PostsListResponse | LaravelPost[] | any): Post[] => {
        const rawPosts = Array.isArray(response)
          ? response
          : (response?.data || response?.resource || []);
        return rawPosts.map((p: LaravelPost) => normalizePost(p));
      },
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems, { arg }) => {
        const page = arg && 'page' in arg ? arg.page : 1;
        if (page === 1) {
          return newItems;
        }
        const existingIds = new Set(currentCache.map((post) => post.id));
        const filteredNewItems = newItems.filter((post) => !existingIds.has(post.id));
        return [...currentCache, ...filteredNewItems];
      },
      forceRefetch({ currentArg, previousArg }) {
        const currentPage = currentArg && 'page' in currentArg ? currentArg.page : 1;
        const prevPage = previousArg && 'page' in previousArg ? previousArg.page : 1;
        return currentPage !== prevPage;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Post', id: 'LIST' },
            ]
          : [{ type: 'Post', id: 'LIST' }],
    }),

    getPost: builder.query<Post, string>({
      query: (postId) => `/posts/${postId}`,
      transformResponse: (response: any) =>
        normalizePost(response?.data || response?.resource || response),
      providesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
    }),

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

        // Optimistically update getFeed cache
        const patchFeed = dispatch(
          postsApi.util.updateQueryData('getFeed', undefined as any, (draft) => {
            if (!draft?.posts) return;
            const post = draft.posts.find((p) => p.id === postId);
            if (post) {
              post.liked = nextLiked;
              const currentNum = parseInt(post.likes || '0', 10) || 0;
              post.likes = String(nextLiked ? currentNum + 1 : Math.max(0, currentNum - 1));
            }
          })
        );

        // Optimistically update getPosts cache
        const patchPosts = dispatch(
          postsApi.util.updateQueryData('getPosts', undefined as any, (draft) => {
            if (!Array.isArray(draft)) return;
            const post = draft.find((p) => p.id === postId);
            if (post) {
              post.liked = nextLiked;
              const currentNum = parseInt(post.likes || '0', 10) || 0;
              post.likes = String(nextLiked ? currentNum + 1 : Math.max(0, currentNum - 1));
            }
          })
        );

        // Optimistically update single getPost cache if present
        const patchSingle = dispatch(
          postsApi.util.updateQueryData('getPost', postId, (draft) => {
            if (draft) {
              draft.liked = nextLiked;
              const currentNum = parseInt(draft.likes || '0', 10) || 0;
              draft.likes = String(nextLiked ? currentNum + 1 : Math.max(0, currentNum - 1));
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchFeed.undo();
          patchPosts.undo();
          patchSingle.undo();
        }
      },
      invalidatesTags: (result, error, { postId }) => [{ type: 'Post', id: postId }],
    }),

    incrementPostCommentCount: builder.mutation<
      void,
      { postId: string; comments?: string }
    >({
      queryFn: () => ({ data: undefined }),
      async onQueryStarted({ postId }, { dispatch }) {
        dispatch(
          postsApi.util.updateQueryData('getFeed', undefined as any, (draft) => {
            const post = draft?.posts?.find((p) => p.id === postId);
            if (post) {
              const current = parseInt(post.comments || '0', 10) || 0;
              post.comments = String(current + 1);
            }
          })
        );
        dispatch(
          postsApi.util.updateQueryData('getPosts', undefined as any, (draft) => {
            const post = draft?.find((p) => p.id === postId);
            if (post) {
              const current = parseInt(post.comments || '0', 10) || 0;
              post.comments = String(current + 1);
            }
          })
        );
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFeedQuery,
  useGetPostsQuery,
  useGetPostQuery,
  useToggleLikePostMutation,
  useIncrementPostCommentCountMutation,
} = postsApi;
