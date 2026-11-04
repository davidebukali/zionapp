import { baseApi } from "../../services/baseApi";
import { DiscoverAccount } from "../../components/Discover/types";
import { FeedResult } from "../posts/types";
import { normalizePost } from "../posts/utils";
import {
  BackendProfile,
  BackendUser,
  Church,
  ChurchesResponse,
  FollowResponse,
  GetChurchesParams,
  SearchUsersParams,
  SearchUsersResponse,
  UnfollowResponse,
  UpdateProfilePayload,
} from "./types";
import {
  normalizeDiscoverAccount,
  updateProfileFollowInCaches,
  updateUserInCaches,
} from "./utils";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchUsers: builder.query<
      DiscoverAccount[],
      SearchUsersParams | { q?: string } | void
    >({
      query: (arg) => {
        const queryTerm = typeof arg === "object" && arg?.q ? arg.q : "*";
        const page =
          (typeof arg === "object" && (arg as SearchUsersParams)?.page) || 1;
        const perPage =
          (typeof arg === "object" && (arg as SearchUsersParams)?.per_page) || 20;

        return {
          url: "/search",
          params: {
            type: "users",
            q: queryTerm,
            page,
            per_page: perPage,
          },
        };
      },
      transformResponse: (
        response: SearchUsersResponse | any
      ): DiscoverAccount[] => {
        const rawUsers: BackendUser[] = Array.isArray(response)
          ? response
          : response?.data || [];
        return rawUsers.map((u) => normalizeDiscoverAccount(u));
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    followUser: builder.mutation<
      FollowResponse,
      { userId: string; searchArgs?: { q: string } }
    >({
      query: ({ userId }) => ({
        url: `/users/${userId}/follow`,
        method: "POST",
      }),
      async onQueryStarted({ userId, searchArgs }, { dispatch, queryFulfilled }) {
        const undoDiscover = updateUserInCaches(
          usersApi,
          dispatch,
          userId,
          (account) => {
            account.isFollowing = true;
          },
          searchArgs
        );
        const undoProfile = updateProfileFollowInCaches(
          usersApi,
          dispatch,
          userId,
          true
        );

        try {
          await queryFulfilled;
        } catch {
          undoDiscover();
          undoProfile();
        }
      },
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: `${userId}_followers` },
        { type: "Conversation", id: "RECIPIENTS" },
      ],
    }),

    unfollowUser: builder.mutation<
      UnfollowResponse,
      { userId: string; searchArgs?: { q: string } }
    >({
      query: ({ userId }) => ({
        url: `/users/${userId}/follow`,
        method: "DELETE",
      }),
      async onQueryStarted({ userId, searchArgs }, { dispatch, queryFulfilled }) {
        const undoDiscover = updateUserInCaches(
          usersApi,
          dispatch,
          userId,
          (account) => {
            account.isFollowing = false;
          },
          searchArgs
        );
        const undoProfile = updateProfileFollowInCaches(
          usersApi,
          dispatch,
          userId,
          false
        );

        try {
          await queryFulfilled;
        } catch {
          undoDiscover();
          undoProfile();
        }
      },
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: `${userId}_followers` },
        { type: "Conversation", id: "RECIPIENTS" },
      ],
    }),

    getUserProfile: builder.query<BackendProfile, string>({
      query: (userId) => `/users/${userId}/profile`,
      transformResponse: (response: { data: BackendProfile } | BackendProfile) => {
        return (response as { data: BackendProfile })?.data || response;
      },
      providesTags: (_result, _error, userId) => [{ type: "User", id: userId }],
    }),

    getUserFollowersCount: builder.query<{ total: number }, string>({
      query: (userId) => ({
        url: `/users/${userId}/followers`,
        params: { per_page: 1 },
      }),
      transformResponse: (response: any) => {
        const total = response?.meta?.meta?.total ?? response?.meta?.total ?? 0;
        return { total };
      },
      providesTags: (_result, _error, userId) => [
        { type: "User", id: `${userId}_followers` },
      ],
    }),

    getUserFollowingCount: builder.query<{ total: number }, string>({
      query: (userId) => ({
        url: `/users/${userId}/following`,
        params: { per_page: 1 },
      }),
      transformResponse: (response: any) => {
        const total = response?.meta?.meta?.total ?? response?.meta?.total ?? 0;
        return { total };
      },
      providesTags: (_result, _error, userId) => [
        { type: "User", id: `${userId}_following` },
      ],
    }),

    getUserPosts: builder.query<
      FeedResult,
      { userId: string; cursor?: string; perPage?: number }
    >({
      query: ({ userId, cursor, perPage = 15 }) => ({
        url: `/users/${userId}/posts`,
        params: {
          cursor,
          per_page: perPage,
        },
      }),
      transformResponse: (response: any): FeedResult => {
        const items = response?.data || [];
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
      },
      providesTags: (_result, _error, { userId }) => [
        { type: "Post", id: `USER_${userId}` },
      ],
    }),

    updateProfile: builder.mutation<BackendProfile, UpdateProfilePayload>({
      query: (body) => ({
        url: "/profile",
        method: "PUT",
        body,
      }),
      transformResponse: (response: any) => {
        return response?.data || response;
      },
      invalidatesTags: ["User"],
    }),

    getChurches: builder.query<Church[], GetChurchesParams | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {
          per_page: params?.per_page ?? 50,
        };
        if (params?.search && params.search.trim()) {
          queryParams.search = params.search.trim();
        }
        return {
          url: "/churches",
          params: queryParams,
        };
      },
      transformResponse: (response: ChurchesResponse | any): Church[] => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.data?.data)) return response.data.data;
        return [];
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useSearchUsersQuery,
  useLazySearchUsersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetUserProfileQuery,
  useLazyGetUserProfileQuery,
  useGetUserFollowersCountQuery,
  useGetUserFollowingCountQuery,
  useGetUserPostsQuery,
  useLazyGetUserPostsQuery,
  useUpdateProfileMutation,
  useGetChurchesQuery,
  useLazyGetChurchesQuery,
} = usersApi;

