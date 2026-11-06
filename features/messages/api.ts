import { baseApi } from "../../services/baseApi";
import {
  BackendConversation,
  BackendMessage,
  BackendRecipient,
  Conversation,
  ConversationResponse,
  ConversationsListResponse,
  ConversationsResult,
  DeleteMessageResponse,
  EditMessageRequest,
  EditMessageResponse,
  GetConversationsParams,
  GetMessagesParams,
  GetRecipientsParams,
  MessagesListResponse,
  MessagesResult,
  ReactMessageRequest,
  ReactionResponse,
  RecipientsListResponse,
  RecipientsResult,
  ReportRequest,
  SendMessageRequest,
  SendMessageResponse,
  StartConversationRequest,
} from "./types";
import {
  insertMessageInCache,
  mergeConversationsCache,
  mergeMessagesCache,
  mergeRecipientsCache,
  normalizeConversation,
  normalizeMessage,
  normalizeRecipient,
  updateMessageInCache,
} from "./utils";
import type { RootState } from "../../store/store";

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1.1 List Conversations (Inbox)
    getConversations: builder.query<ConversationsResult, GetConversationsParams | void>({
      query: (params) => {
        const queryParams: Record<string, string | number | boolean> = {};
        if (params?.per_page) queryParams.per_page = params.per_page;
        if (params?.cursor) queryParams.cursor = params.cursor;
        if (params?.q) queryParams.q = params.q;
        if (params?.archived !== undefined) queryParams.archived = params.archived;

        return {
          url: "/conversations",
          method: "GET",
          params: queryParams,
        };
      },
      transformResponse: (
        response: ConversationsListResponse,
        meta,
        arg
      ): ConversationsResult => {
        const rawConversations = Array.isArray(response?.data) ? response.data : [];
        return {
          conversations: rawConversations
            .filter(
              (c): c is BackendConversation =>
                Boolean(c?.id && c?.recipient?.id && (c?.recipient?.name || c?.recipient?.username))
            )
            .map((c) => normalizeConversation(c, arg?.currentUserId)),
          nextCursor: response?.meta?.next_cursor ?? null,
        };
      },
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems, { arg }) => {
        mergeConversationsCache(currentCache, newItems, arg?.cursor);
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor || currentArg?.q !== previousArg?.q,
      providesTags: (result) =>
        result?.conversations
          ? [
              { type: "Conversation" as const, id: "LIST" },
              ...result.conversations
                .filter((c): c is Conversation => Boolean(c?.id))
                .map((c) => ({
                  type: "Conversation" as const,
                  id: c.id,
                })),
            ]
          : [{ type: "Conversation" as const, id: "LIST" }],
    }),

    // 1.2 List Messageable Recipients
    getMessageableRecipients: builder.query<RecipientsResult, GetRecipientsParams | void>({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params?.per_page) queryParams.per_page = params.per_page;
        if (params?.cursor) queryParams.cursor = params.cursor;
        if (params?.q) queryParams.q = params.q;

        return {
          url: "/conversations/recipients",
          method: "GET",
          params: queryParams,
        };
      },
      transformResponse: (response: RecipientsListResponse): RecipientsResult => {
        const raw = Array.isArray(response?.data) ? response.data : [];
        return {
          recipients: raw
            .filter(
              (r): r is BackendRecipient =>
                Boolean(r?.id && (r?.name || r?.username))
            )
            .map(normalizeRecipient),
          nextCursor: response?.meta?.next_cursor ?? null,
        };
      },
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems, { arg }) => {
        mergeRecipientsCache(currentCache, newItems, arg?.cursor);
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor || currentArg?.q !== previousArg?.q,
      providesTags: [{ type: "Conversation", id: "RECIPIENTS" }],
    }),

    // 1.3 Start or Get Conversation (Idempotent)
    startOrGetConversation: builder.mutation<BackendConversation, StartConversationRequest>({
      query: ({ recipient_id }) => ({
        url: "/conversations",
        method: "POST",
        body: { recipient_id },
      }),
      transformResponse: (response: ConversationResponse) => response.data,
      invalidatesTags: [{ type: "Conversation", id: "LIST" }],
    }),

    // 1.4 Get Conversation Details
    getConversationDetails: builder.query<BackendConversation, string>({
      query: (conversationId) => `/conversations/${conversationId}`,
      transformResponse: (response: ConversationResponse) => response.data,
      providesTags: (result, error, id) => [{ type: "Conversation", id }],
    }),

    // 1.5 Mark Conversation as Read
    markConversationAsRead: builder.mutation<void, string>({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/read`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: (result, error, id) => [{ type: "Conversation", id }],
    }),

    // 1.6 Send Typing Indicator
    sendTypingIndicator: builder.mutation<void, string>({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/typing`,
        method: "POST",
        body: {},
      }),
    }),

    // 1.7 Conversation Management
    archiveConversation: builder.mutation<void, string>({
      query: (id) => ({ url: `/conversations/${id}/archive`, method: "POST" }),
      invalidatesTags: [{ type: "Conversation", id: "LIST" }],
    }),

    unarchiveConversation: builder.mutation<void, string>({
      query: (id) => ({ url: `/conversations/${id}/unarchive`, method: "POST" }),
      invalidatesTags: [{ type: "Conversation", id: "LIST" }],
    }),

    muteConversation: builder.mutation<void, string>({
      query: (id) => ({ url: `/conversations/${id}/mute`, method: "POST" }),
      invalidatesTags: (result, error, id) => [{ type: "Conversation", id }],
    }),

    unmuteConversation: builder.mutation<void, string>({
      query: (id) => ({ url: `/conversations/${id}/unmute`, method: "POST" }),
      invalidatesTags: (result, error, id) => [{ type: "Conversation", id }],
    }),

    deleteConversation: builder.mutation<void, string>({
      query: (id) => ({ url: `/conversations/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Conversation", id: "LIST" },
        { type: "Conversation", id },
        { type: "Message", id: `LIST_${id}` },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const undoPatch = dispatch(
          messagesApi.util.updateQueryData(
            "getMessages",
            { conversationId: id },
            (draft) => {
              if (draft) {
                draft.messages = [];
                draft.nextCursor = null;
              }
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          undoPatch.undo();
        }
      },
    }),

    reportConversation: builder.mutation<void, ReportRequest>({
      query: ({ id, reason, description }) => ({
        url: `/conversations/${id}/report`,
        method: "POST",
        body: { reason, description },
      }),
    }),

    // 2.1 List Messages in Conversation
    getMessages: builder.query<MessagesResult, GetMessagesParams>({
      query: ({ conversationId, per_page = 30, cursor }) => {
        const params: Record<string, string | number> = { per_page };
        if (cursor) params.cursor = cursor;
        return {
          url: `/conversations/${conversationId}/messages`,
          method: "GET",
          params,
        };
      },
      transformResponse: (
        response: MessagesListResponse,
        meta,
        arg
      ): MessagesResult => {
        const raw = Array.isArray(response?.data) ? response.data : [];
        return {
          messages: raw.map((m) => normalizeMessage(m, arg.currentUserId)),
          nextCursor: response?.meta?.next_cursor ?? null,
        };
      },
      serializeQueryArgs: ({ queryArgs }) => queryArgs.conversationId,
      merge: (currentCache, newItems, { arg }) => {
        mergeMessagesCache(currentCache, newItems, arg?.cursor);
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      providesTags: (result, error, { conversationId }) => [
        { type: "Message", id: `LIST_${conversationId}` },
      ],
    }),

    // 2.2 Send Message
    sendMessage: builder.mutation<BackendMessage, SendMessageRequest>({
      query: ({ conversationId, body, media_ids, reply_to_message_id }) => ({
        url: `/conversations/${conversationId}/messages`,
        method: "POST",
        body: {
          ...(body ? { body } : {}),
          ...(media_ids && media_ids.length > 0 ? { media_ids } : {}),
          ...(reply_to_message_id ? { reply_to_message_id } : {}),
        },
      }),
      transformResponse: (response: SendMessageResponse) => response.data,
      async onQueryStarted(
        { conversationId, body, media_ids, reply_to_message_id, optimisticMediaUrls },
        { dispatch, getState, queryFulfilled }
      ) {
        const currentUserId = (getState() as RootState).auth?.user?.id;
        const tempId = `temp-${Date.now()}`;
        const optimisticMedia =
          optimisticMediaUrls && optimisticMediaUrls.length > 0
            ? optimisticMediaUrls.map((url, index) => ({
                id: `opt-media-${index}-${Date.now()}`,
                url,
                type: "image",
                mime_type: "image/jpeg",
                size: 0,
              }))
            : [];

        const optimisticMessage = normalizeMessage(
          {
            id: tempId,
            conversation_id: conversationId,
            sender_id: String(currentUserId || "current-user"),
            sender: {
              id: String(currentUserId || "current-user"),
              name: (getState() as RootState).auth?.user?.name || "Me",
              username: "",
            },
            body: body || null,
            media: optimisticMedia,
            reply_to: null,
            reactions: [],
            is_edited: false,
            is_deleted_for_everyone: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          currentUserId ? String(currentUserId) : undefined
        );

        const undoOptimistic = insertMessageInCache(
          messagesApi,
          dispatch,
          conversationId,
          optimisticMessage
        );

        try {
          const { data: serverMessage } = await queryFulfilled;
          // Replace optimistic message with actual server message
          const normalized = normalizeMessage(
            serverMessage,
            currentUserId ? String(currentUserId) : undefined
          );
          updateMessageInCache(
            messagesApi,
            dispatch,
            conversationId,
            tempId,
            (draftMsg) => {
              Object.assign(draftMsg, normalized);
            }
          );
        } catch {
          undoOptimistic();
        }
      },
      invalidatesTags: (result, error, { conversationId }) => [
        { type: "Conversation", id: conversationId },
        { type: "Conversation", id: "LIST" },
      ],
    }),

    // 2.3 Edit Message
    editMessage: builder.mutation<EditMessageResponse["data"], EditMessageRequest>({
      query: ({ messageId, body }) => ({
        url: `/messages/${messageId}`,
        method: "PATCH",
        body: { body },
      }),
      transformResponse: (response: EditMessageResponse) => response.data,
      async onQueryStarted(
        { conversationId, messageId, body },
        { dispatch, queryFulfilled }
      ) {
        const undo = updateMessageInCache(
          messagesApi,
          dispatch,
          conversationId,
          messageId,
          (msg) => {
            msg.text = body;
            msg.isEdited = true;
          }
        );
        try {
          await queryFulfilled;
        } catch {
          undo();
        }
      },
    }),

    // 2.4 Delete Message for Everyone
    deleteMessageForEveryone: builder.mutation<
      DeleteMessageResponse["data"],
      { messageId: string; conversationId: string }
    >({
      query: ({ messageId }) => ({
        url: `/messages/${messageId}`,
        method: "DELETE",
      }),
      transformResponse: (response: DeleteMessageResponse) => response.data,
      async onQueryStarted(
        { conversationId, messageId },
        { dispatch, queryFulfilled }
      ) {
        const undo = updateMessageInCache(
          messagesApi,
          dispatch,
          conversationId,
          messageId,
          (msg) => {
            msg.text = "This message was deleted";
            msg.mediaUrl = undefined;
            msg.media = [];
            msg.isDeletedForEveryone = true;
          }
        );
        try {
          await queryFulfilled;
        } catch {
          undo();
        }
      },
    }),

    // 2.5 Delete Message for Me
    deleteMessageForMe: builder.mutation<
      void,
      { messageId: string; conversationId: string }
    >({
      query: ({ messageId }) => ({
        url: `/messages/${messageId}/delete-for-me`,
        method: "POST",
      }),
      async onQueryStarted(
        { conversationId, messageId },
        { dispatch, queryFulfilled }
      ) {
        const undo = dispatch(
          messagesApi.util.updateQueryData(
            "getMessages",
            { conversationId },
            (draft) => {
              if (draft && draft.messages) {
                draft.messages = draft.messages.filter((m) => m.id !== messageId);
              }
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          undo.undo();
        }
      },
    }),

    // 2.6 Message Reactions
    reactToMessage: builder.mutation<
      ReactionResponse["data"],
      ReactMessageRequest
    >({
      query: ({ messageId, emoji }) => ({
        url: `/messages/${messageId}/reactions`,
        method: "POST",
        body: { emoji },
      }),
      transformResponse: (response: ReactionResponse) => response.data,
    }),

    removeMessageReaction: builder.mutation<
      void,
      { messageId: string; conversationId: string }
    >({
      query: ({ messageId }) => ({
        url: `/messages/${messageId}/reactions`,
        method: "DELETE",
      }),
    }),

    // 2.7 Report Message
    reportMessage: builder.mutation<void, ReportRequest>({
      query: ({ id, reason, description }) => ({
        url: `/messages/${id}/report`,
        method: "POST",
        body: { reason, description },
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetConversationsQuery,
  useLazyGetConversationsQuery,
  useGetMessageableRecipientsQuery,
  useStartOrGetConversationMutation,
  useGetConversationDetailsQuery,
  useMarkConversationAsReadMutation,
  useSendTypingIndicatorMutation,
  useArchiveConversationMutation,
  useUnarchiveConversationMutation,
  useMuteConversationMutation,
  useUnmuteConversationMutation,
  useDeleteConversationMutation,
  useReportConversationMutation,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useSendMessageMutation,
  useEditMessageMutation,
  useDeleteMessageForEveryoneMutation,
  useDeleteMessageForMeMutation,
  useReactToMessageMutation,
  useRemoveMessageReactionMutation,
  useReportMessageMutation,
} = messagesApi;

