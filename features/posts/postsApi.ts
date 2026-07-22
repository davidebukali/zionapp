import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { current_ip } from '../../constants';
import { Post } from './postSlice';

function parseLikes(likes: string | undefined): number {
  if (!likes) return 0;
  const normalized = likes.toLowerCase().trim();
  if (normalized.endsWith('k')) {
    const num = parseFloat(normalized.slice(0, -1));
    return isNaN(num) ? 0 : num * 1000;
  }
  const parsed = parseInt(normalized, 10);
  return isNaN(parsed) ? 0 : parsed;
}

function formatLikes(likesCount: number): string {
  if (likesCount >= 1000) {
    return (likesCount / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return String(likesCount);
}

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: `http://${current_ip}:3000/` }),
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], { page: number; limit: number }>({
      query: ({ page, limit }) => `posts?_page=${page}&_per_page=${limit}`,
      transformResponse: (response: any) => {
        return Array.isArray(response) ? response : (response.data || []);
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        const existingIds = new Set(currentCache.map(post => post.id));
        const filteredNewItems = newItems.filter(post => !existingIds.has(post.id));
        return [...currentCache, ...filteredNewItems];
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Post', id: 'LIST' },
            ]
          : [{ type: 'Post', id: 'LIST' }],
    }),
    toggleLikePost: builder.mutation<Post, { postId: string; liked: boolean; likes: string }>({
      query: ({ postId, liked, likes }) => {
        const nextLiked = !liked;
        const currentLikesNum = parseLikes(likes);
        const nextLikesNum = nextLiked ? currentLikesNum + 1 : Math.max(0, currentLikesNum - 1);
        const nextLikes = formatLikes(nextLikesNum);

        return {
          url: `posts/${postId}`,
          method: 'PATCH',
          body: {
            liked: nextLiked,
            likes: nextLikes,
          },
        };
      },
      async onQueryStarted({ postId, liked, likes }, { dispatch, queryFulfilled }) {
        const nextLiked = !liked;
        const currentLikesNum = parseLikes(likes);
        const nextLikesNum = nextLiked ? currentLikesNum + 1 : Math.max(0, currentLikesNum - 1);
        const nextLikes = formatLikes(nextLikesNum);

        // Optimistically patch the getPosts cache
        const patchResult = dispatch(
          postsApi.util.updateQueryData('getPosts', { page: 1, limit: 3 }, (draft) => {
            const post = draft.find((p) => p.id === postId);
            if (post) {
              post.liked = nextLiked;
              post.likes = nextLikes;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { postId }) => [{ type: 'Post', id: postId }],
    }),
  }),
});

export const { useGetPostsQuery, useToggleLikePostMutation } = postsApi;
