import { useCallback, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
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

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const activeSearchTerm = debouncedQuery.trim() || "*";

  // Fetch accounts from Search API (defaults to '*' when empty)
  const {
    data: rawAccounts = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useSearchUsersQuery({ q: activeSearchTerm });

  // Exclude current authenticated user defensively
  const accounts = useMemo(() => {
    if (!currentUser?.id) return rawAccounts;
    const currentUserIdStr = String(currentUser.id);
    return rawAccounts.filter((account) => String(account.id) !== currentUserIdStr);
  }, [rawAccounts, currentUser?.id]);

  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const [pendingFollowIds, setPendingFollowIds] = useState<Record<string, boolean>>({});
  const pendingFollowSetRef = useRef(new Set<string>());

  const handleToggleFollow = useCallback(
    async (account: DiscoverAccount) => {
      if (currentUser?.id && String(account.id) === String(currentUser.id)) {
        return;
      }
      if (pendingFollowSetRef.current.has(account.id)) {
        return;
      }

      pendingFollowSetRef.current.add(account.id);
      setPendingFollowIds((prev) => ({ ...prev, [account.id]: true }));

      const searchArgs = { q: activeSearchTerm };
      try {
        if (account.isFollowing) {
          await unfollowUser({ userId: account.id, searchArgs }).unwrap();
        } else {
          await followUser({ userId: account.id, searchArgs }).unwrap();
        }
      } catch {
        // Optimistic update automatically rolls back on error in onQueryStarted
      } finally {
        pendingFollowSetRef.current.delete(account.id);
        setPendingFollowIds((prev) => {
          if (!prev[account.id]) return prev;
          const next = { ...prev };
          delete next[account.id];
          return next;
        });
      }
    },
    [activeSearchTerm, currentUser?.id, followUser, unfollowUser]
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
    pendingFollowIds,
    handleToggleFollow,
    refetch,
  };
}

export default useDiscoverAccounts;

