import { baseApi } from '../../services/baseApi';
import { postsApi } from '../posts/api';
import {
  Comment,
  CommentsResponse,
  CommentsResult,
  CreateCommentRequest,
  SingleCommentResponse,
} from './types';
import {
  normalizeComment,
  updateCommentInCache,
  insertCommentInCache,
  incrementPostCommentCount,
} from './utils';

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
        const undoPostIncrement = incrementPostCommentCount(postsApi, dispatch, postId);

        try {
          const { data: newComment } = await queryFulfilled;
          insertCommentInCache(commentsApi, dispatch, postId, newComment);
        } catch {
          undoPostIncrement();
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
        const nextLiked = !liked;
        const undo = updateCommentInCache(commentsApi, dispatch, postId, commentId, (comment) => {
          comment.liked = nextLiked;
          comment.likes = Math.max(0, comment.likes + (nextLiked ? 1 : -1));
        });

        try {
          await queryFulfilled;
        } catch {
          undo();
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetCommentsQuery,
  useLazyGetCommentsQuery,
  useCreateCommentMutation,
  useToggleLikeCommentMutation,
} = commentsApi;
