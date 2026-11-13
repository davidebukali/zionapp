import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants';
import { deleteUserData } from '../features/auth/authSlice';
import { CrashlyticsService } from './crashlytics';
import type { RootState } from '../store/store';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth?.token;
    headers.set('Accept', 'application/json');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error) {
    const endpoint = typeof args === 'string' ? args : args.url;
    const status = result.error.status;
    CrashlyticsService.log(`[API ${status}] ${endpoint}`);

    if (typeof status === 'number' && status >= 500) {
      CrashlyticsService.recordError(
        new Error(`API ${status} on ${endpoint}`),
        'ApiServerError'
      );
    }

    if (result.error.status === 401) {
      // Automatically log out on 401 Unauthorized
      api.dispatch(deleteUserData());
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Post', 'Feed', 'Comment', 'Conversation', 'Message', 'Notification'],
  endpoints: () => ({}),
});
