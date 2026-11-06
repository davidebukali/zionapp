import { useCallback, useEffect, useState } from "react";
import * as Haptics from "expo-haptics";

import { useDebounce } from "./useDebounce";
import {
  useGetTaggableUsersQuery,
  useLazyGetTaggableUsersQuery,
} from "../features/users/api";
import { TaggableUser } from "../features/users/types";

interface UseFollowedUsersSheetParams {
  visible: boolean;
  onSelectUser: (user: TaggableUser) => void;
  onClose: () => void;
}

export function useFollowedUsersSheet({
  visible,
  onSelectUser,
  onClose,
}: UseFollowedUsersSheetParams) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery.trim());
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset search when sheet is dismissed
  useEffect(() => {
    if (!visible) {
      setSearchQuery("");
    }
  }, [visible]);

  // Primary paginated query
  const {
    data: taggableResult,
    isLoading,
    isFetching,
  } = useGetTaggableUsersQuery(
    debouncedQuery ? { q: debouncedQuery } : undefined,
    { skip: !visible }
  );

  const [lazyFetchTaggableUsers] = useLazyGetTaggableUsersQuery();

  const users = taggableResult?.users ?? [];
  const nextCursor = taggableResult?.nextCursor;
  const hasMore = Boolean(nextCursor);

  // Infinite scroll loader
  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore || isFetching) return;
    setIsLoadingMore(true);
    try {
      await lazyFetchTaggableUsers({
        cursor: nextCursor,
        ...(debouncedQuery ? { q: debouncedQuery } : {}),
      }).unwrap();
    } catch {
      // Handled by RTK Query
    } finally {
      setIsLoadingMore(false);
    }
  }, [debouncedQuery, isFetching, isLoadingMore, lazyFetchTaggableUsers, nextCursor]);

  // Selection handler with tactile feedback
  const handleSelectUser = useCallback(
    (user: TaggableUser) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onSelectUser(user);
      onClose();
    },
    [onClose, onSelectUser]
  );

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    users,
    hasMore,
    isLoading,
    isLoadingMore,
    isSearching: Boolean(debouncedQuery),
    handleLoadMore,
    handleSelectUser,
  };
}

