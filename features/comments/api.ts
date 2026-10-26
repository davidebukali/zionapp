import { baseApi } from '../../services/baseApi';
import { postsApi } from '../posts/api';
import {
  Comment,
  CommentsResponse,
  CommentsResult,
  CreateCommentRequest,
  SingleCommentResponse,
  normalizeComment,
} from './types';

export const commentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query<
      CommentsResult,
      { postId: string; cursor?: string | null; perPage?: number }
    >({
      query: ({ postId, cursor, perPage = 15 }) => {
        const params: Record<string, string | number> = { per_page: perPage };
        if (cursor) {
          params.cursor = cursor;
        }
        return {
          url: `/posts/${postId}/comments`,
          method: 'GET',
          params,
        };
      },
      transformResponse: (response: CommentsResponse): CommentsResult => {
        const rawComments = Array.isArray(response?.data) ? response.data : [];
        return {
          comments: rawComments.map(normalizeComment),
          nextCursor: response?.meta?.meta?.next_cursor ?? null,
        };
      },
      providesTags: (result, error, { postId }) => [
        { type: 'Comment', id: `LIST_${postId}` },
      ],
    }),

    createComment: builder.mutation<Comment, CreateCommentRequest>({
      query: ({ postId, content, media_ids, parent_comment_id }) => ({
        url: `/posts/${postId}/comments`,
        method: 'POST',
        body: {
          content,
          ...(media_ids && media_ids.length > 0 ? { media_ids } : {}),
          ...(parent_comment_id ? { parent_comment_id } : {}),
        },
      }),
      transformResponse: (response: SingleCommentResponse): Comment =>
        normalizeComment(response.data),
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        // Optimistically increment post comment count in Feed and Single Post caches
        const patchPost = dispatch(
          postsApi.util.updateQueryData('getPost', postId, (draft) => {
            if (draft) {
              const current = parseInt(draft.comments || '0', 10) || 0;
              draft.comments = String(current + 1);
            }
          })
        );

        const patchFeed = dispatch(
          postsApi.util.updateQueryData('getFeed', undefined as any, (draft) => {
            const post = draft?.posts?.find((p) => p.id === postId);
            if (post) {
              const current = parseInt(post.comments || '0', 10) || 0;
              post.comments = String(current + 1);
            }
          })
        );

        try {
          const { data: newComment } = await queryFulfilled;
          // Optimistically insert new comment into active comments list cache
          dispatch(
            commentsApi.util.updateQueryData(
              'getComments',
              { postId, cursor: undefined, perPage: 15 },
              (draft) => {
                if (draft && draft.comments) {
                  draft.comments.unshift(newComment);
                }
              }
            )
          );
        } catch {
          patchPost.undo();
          patchFeed.undo();
        }
      },
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Comment', id: `LIST_${postId}` },
      ],
    }),

    toggleLikeComment: builder.mutation<
      { success: boolean },
      { commentId: string; postId: string; liked: boolean }
    >({
      query: ({ commentId, liked }) => ({
        url: `/comments/${commentId}/like`,
        method: liked ? 'DELETE' : 'POST',
      }),
      async onQueryStarted({ commentId, postId, liked }, { dispatch, queryFulfilled }) {
        // Optimistically update comment like state in comments list
        const patchResult = dispatch(
          commentsApi.util.updateQueryData(
            'getComments',
            { postId, cursor: undefined, perPage: 15 },
            (draft) => {
              const comment = draft?.comments?.find((c) => c.id === commentId);
              if (comment) {
                comment.liked = !liked;
                comment.likes = Math.max(0, comment.likes + (!liked ? 1 : -1));
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useLazyGetCommentsQuery,
  useCreateCommentMutation,
  useToggleLikeCommentMutation,
} = commentsApi;
