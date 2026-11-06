import { useCallback, useEffect, useState } from "react";
import * as Haptics from "expo-haptics";

import { DEBOUNCE_DELAY_MS } from "../constants";
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
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, DEBOUNCE_DELAY_MS);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Reset search when sheet is dismissed
  useEffect(() => {
    if (!visible) {
      setSearchQuery("");
      setDebouncedQuery("");
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

