import { baseApi } from '../../services/baseApi';
import {
  GetNotificationsParams,
  NotificationsResponse,
} from './types';
import {
  markAllNotificationsReadInCaches,
  markNotificationReadInCaches,
  mergeNotificationsCache,
} from './utils';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationsResponse,
      GetNotificationsParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, number> = {
          page: params?.page ?? 1,
          per_page: params?.per_page ?? 20,
        };
        return {
          url: '/notifications',
          method: 'GET',
          params: queryParams,
        };
      },
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, incomingResponse, { arg }) => {
        mergeNotificationsCache(
          currentCache,
          incomingResponse,
          arg ? arg.page : 1
        );
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
      providesTags: (result) =>
        result?.data
          ? [
              { type: 'Notification' as const, id: 'LIST' },
              ...result.data.map((notification) => ({
                type: 'Notification' as const,
                id: notification.id,
              })),
            ]
          : [{ type: 'Notification' as const, id: 'LIST' }],
    }),

    markNotificationAsRead: builder.mutation<void, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'POST',
      }),
      async onQueryStarted(notificationId, { dispatch, queryFulfilled }) {
        const undo = markNotificationReadInCaches(
          notificationsApi,
          dispatch,
          notificationId,
          new Date().toISOString()
        );
        try {
          await queryFulfilled;
        } catch {
          undo();
        }
      },
      invalidatesTags: (_result, _error, notificationId) => [
        { type: 'Notification', id: notificationId },
      ],
    }),

    markAllNotificationsAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'POST',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const undo = markAllNotificationsReadInCaches(
          notificationsApi,
          dispatch,
          new Date().toISOString()
        );
        try {
          await queryFulfilled;
        } catch {
          undo();
        }
      },
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} = notificationsApi;

