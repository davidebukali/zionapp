import { baseApi } from '../../services/baseApi';
import { postsApi } from '../posts/api';
import {
  Comment,
  CommentRepliesResult,
  CommentsResponse,
  CommentsResult,
  CreateCommentRequest,
  CreateReplyRequest,
  SingleCommentResponse,
} from './types';
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
      serializeQueryArgs: ({ queryArgs }) => queryArgs.postId,
      merge: (currentCache, newItems, { arg }) => {
        mergeCommentsCache(currentCache, newItems, arg?.cursor);
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      providesTags: (result, error, { postId }) => [
        { type: 'Comment', id: `LIST_${postId}` },
      ],
    }),

    getCommentReplies: builder.query<
      CommentRepliesResult,
      { commentId: string; cursor?: string | null; perPage?: number }
    >({
      query: ({ commentId, cursor, perPage = 15 }) => {
        const params: Record<string, string | number> = { per_page: perPage };
        if (cursor) {
          params.cursor = cursor;
        }
        return {
          url: `/comments/${commentId}/replies`,
          method: 'GET',
          params,
        };
      },
      transformResponse: (response: CommentsResponse): CommentRepliesResult => {
        const rawComments = Array.isArray(response?.data) ? response.data : [];
        return {
          replies: rawComments.map(normalizeComment),
          nextCursor: response?.meta?.meta?.next_cursor ?? null,
        };
      },
      serializeQueryArgs: ({ queryArgs }) => queryArgs.commentId,
      merge: (currentCache, newItems, { arg }) => {
        mergeCommentRepliesCache(currentCache, newItems, arg?.cursor);
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      providesTags: (result, error, { commentId }) => [
        { type: 'Comment', id: `REPLIES_${commentId}` },
      ],
    }),

    createComment: builder.mutation<Comment, CreateCommentRequest>({
      query: ({ postId, content, media_ids, parent_comment_id, tagged_user_ids }) => ({
        url: `/posts/${postId}/comments`,
        method: 'POST',
        body: {
          content,
          ...(media_ids && media_ids.length > 0 ? { media_ids } : {}),
          ...(parent_comment_id ? { parent_comment_id } : {}),
          ...(tagged_user_ids && tagged_user_ids.length > 0 ? { tagged_user_ids } : {}),
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

    createReply: builder.mutation<Comment, CreateReplyRequest>({
      query: ({ commentId, content, tagged_user_ids }) => ({
        url: `/comments/${commentId}/replies`,
        method: 'POST',
        body: {
          content,
          ...(tagged_user_ids && tagged_user_ids.length > 0 ? { tagged_user_ids } : {}),
        },
      }),
      transformResponse: (response: SingleCommentResponse): Comment =>
        normalizeComment(response.data),
      async onQueryStarted({ commentId, postId }, { dispatch, queryFulfilled }) {
        const undoReplyCount = incrementCommentReplyCount(commentsApi, dispatch, postId, commentId);
        const undoPostIncrement = incrementPostCommentCount(postsApi, dispatch, postId);

        try {
          const { data: newReply } = await queryFulfilled;
          insertReplyInCache(commentsApi, dispatch, commentId, newReply);
        } catch {
          undoReplyCount();
          undoPostIncrement();
        }
      },
      invalidatesTags: (result, error, { commentId }) => [
        { type: 'Comment', id: `REPLIES_${commentId}` },
      ],
    }),

    toggleLikeComment: builder.mutation<
      { success: boolean },
      { commentId: string; postId: string; liked: boolean; parentCommentId?: string | null }
    >({
      query: ({ commentId, liked }) => ({
        url: `/comments/${commentId}/like`,
        method: liked ? 'DELETE' : 'POST',
      }),
      async onQueryStarted({ commentId, postId, liked, parentCommentId }, { dispatch, queryFulfilled }) {
        const nextLiked = !liked;
        const undo = parentCommentId
          ? updateReplyInCache(commentsApi, dispatch, parentCommentId, commentId, (targetReply) => {
              targetReply.liked = nextLiked;
              targetReply.likes = Math.max(0, targetReply.likes + (nextLiked ? 1 : -1));
            })
          : updateCommentInCache(commentsApi, dispatch, postId, commentId, (targetComment) => {
              targetComment.liked = nextLiked;
              targetComment.likes = Math.max(0, targetComment.likes + (nextLiked ? 1 : -1));
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
  useGetCommentRepliesQuery,
  useLazyGetCommentRepliesQuery,
  useCreateCommentMutation,
  useCreateReplyMutation,
  useToggleLikeCommentMutation,
} = commentsApi;
