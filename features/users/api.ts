import { baseApi } from "../../services/baseApi";
import { DiscoverAccount } from "../../components/Discover/types";
import {
  BackendUser,
  FollowResponse,
  SearchUsersParams,
  SearchUsersResponse,
  UnfollowResponse,
} from "./types";
import { normalizeDiscoverAccount, updateUserInCaches } from "./utils";

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
        const undo = updateUserInCaches(
          usersApi,
          dispatch,
          userId,
          (account) => {
            account.isFollowing = true;
          },
          searchArgs
        );

        try {
          await queryFulfilled;
        } catch {
          undo();
        }
      },
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "User", id: userId },
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
        const undo = updateUserInCaches(
          usersApi,
          dispatch,
          userId,
          (account) => {
            account.isFollowing = false;
          },
          searchArgs
        );

        try {
          await queryFulfilled;
        } catch {
          undo();
        }
      },
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "User", id: userId },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useSearchUsersQuery,
  useLazySearchUsersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} = usersApi;

