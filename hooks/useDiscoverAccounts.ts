import { useCallback, useState } from "react";
import { DiscoverAccount } from "../components/Discover/types";
import {
  useFollowUserMutation,
  useSearchUsersQuery,
  useUnfollowUserMutation,
} from "../features/users/api";
import { useDebounce } from "./useDebounce";

export function useDiscoverAccounts() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const activeSearchTerm = debouncedQuery.trim() || "*";

  // Fetch accounts from Search API (defaults to '*' when empty)
  const {
    data: accounts = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useSearchUsersQuery({ q: activeSearchTerm });

  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const handleToggleFollow = useCallback(
    async (account: DiscoverAccount) => {
      const searchArgs = { q: activeSearchTerm };
      try {
        if (account.isFollowing) {
          await unfollowUser({ userId: account.id, searchArgs }).unwrap();
        } else {
          await followUser({ userId: account.id, searchArgs }).unwrap();
        }
      } catch (err) {
        // Optimistic update automatically rolls back on error in onQueryStarted
      }
    },
    [activeSearchTerm, followUser, unfollowUser]
  );

  return {
    accounts,
    isLoading,
    isFetching,
    isError,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    handleToggleFollow,
    refetch,
  };
}

export default useDiscoverAccounts;

