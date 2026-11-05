import { useCallback, useEffect, useState } from "react";
import { useGetFeedQuery } from "../features/posts/api";

export function useHomeFeed() {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: feedData,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetFeedQuery({ cursor });

  const posts = feedData?.posts ?? [];
  const hasMore = Boolean(feedData?.nextCursor);

  // Reset refreshing state when query finishes loading
  useEffect(() => {
    if (!isFetching) {
      setIsRefreshing(false);
    }
  }, [isFetching]);

  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasMore && feedData?.nextCursor) {
      setCursor(feedData.nextCursor);
    }
  }, [isFetching, hasMore, feedData?.nextCursor]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setCursor(undefined);
    refetch();
  }, [refetch]);

  return {
    posts,
    isInitialLoading: isFetching && !feedData,
    hasError: isError,
    error,
    hasMore,
    isLoadingMore: isFetching && Boolean(cursor),
    isRefreshing,
    handleLoadMore,
    handleRefresh,
  };
}

