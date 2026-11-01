import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { globalStyles } from "../../../assets/styles/theme";
import {
  DiscoverAccountCard,
  DiscoverFilterBar,
  DiscoverSearchBar,
} from "../../../components/Discover";
import { useDiscoverAccounts } from "../../../hooks/useDiscoverAccounts";

const CATEGORIES = [
  "All",
  "Churches",
  "Ministries",
  "Pastors & Leaders",
  "Blogs",
  "Podcasts",
];

export default function Discover() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const {
    accounts,
    isLoading,
    isFetching,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    handleToggleFollow,
    refetch,
  } = useDiscoverAccounts();

  const handlePressProfile = useCallback((_accountId: string) => {
    // Navigation stub for future profile integration
  }, []);

  const renderHeader = () => (
    <View>
      <DiscoverSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <DiscoverFilterBar
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <Text
        style={[
          styles.sectionHeaderTitle,
          { color: theme.colors.onBackground },
        ]}
      >
        {searchQuery.trim() ? "Search results" : "Suggested for you"}
      </Text>
    </View>
  );

  const renderEmptyComponent = () => {
    if (isLoading || isFetching) return null;

    return (
      <View style={styles.centeredState}>
        <Text
          style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
        >
          {searchQuery.trim()
            ? `No accounts found for "${searchQuery}".`
            : "No suggested accounts found."}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={[
        globalStyles.screen,
        {
          backgroundColor: theme.colors.background,
          paddingTop: Math.max(insets.top, 16),
        },
      ]}
    >
      {isLoading && accounts.length === 0 ? (
        <View style={styles.loadingContainer}>
          {renderHeader()}
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        </View>
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DiscoverAccountCard
              account={item}
              onToggleFollow={() => handleToggleFollow(item)}
              onPressProfile={handlePressProfile}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && accounts.length > 0}
              onRefresh={refetch}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  loadingContainer: {
    paddingHorizontal: 16,
    flex: 1,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 16,
  },
  centeredState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
  },
});
