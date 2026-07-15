import React, { useCallback } from "react";
import {
  FlatList,
  FlatListProps,
  ActivityIndicator,
  StyleSheet,
  View,
  RefreshControl,
} from "react-native";
import { useTheme } from "react-native-paper";

interface InfiniteScrollListProps<T> extends Omit<FlatListProps<T>, "data" | "renderItem"> {
  data: T[];
  renderItem: FlatListProps<T>["renderItem"];
  onLoadMore: () => void;
  isLoadingMore: boolean;
  hasMore: boolean;
  onRefresh?: () => Promise<void> | void;
  isRefreshing?: boolean;
}

export function InfiniteScrollList<T>({
  data,
  renderItem,
  onLoadMore,
  isLoadingMore,
  hasMore,
  onRefresh,
  isRefreshing = false,
  ...flatListProps
}: InfiniteScrollListProps<T>) {
  const theme = useTheme();

  const renderFooter = useCallback(() => {
    if (!isLoadingMore || !hasMore) return null;

    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [isLoadingMore, hasMore, theme.colors.primary]);

  const handleEndReached = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      onLoadMore();
    }
  }, [isLoadingMore, hasMore, onLoadMore]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item, index) => (item as any).id?.toString() || index.toString()}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
      ListFooterComponent={renderFooter}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        ) : undefined
      }
      initialNumToRender={6}
      maxToRenderPerBatch={10}
      windowSize={11}
      removeClippedSubviews={true}
      {...flatListProps}
    />
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
