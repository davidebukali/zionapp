import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { globalStyles } from "../../../assets/styles/theme";
import { Tabs } from "../../../components/Common/Tabs";
import {
  DiscoverAccount,
  DiscoverAccountCard,
  DiscoverFilterBar,
  DiscoverSearchBar,
  DiscoverTabType,
} from "../../../components/Discover";
import { FeedPostItem } from "../../../components/Posts/Feed/FeedPostItem";
import { ReportPostSheet } from "../../../components/Posts/Report/ReportPostSheet";
import { SharePostBottomSheet } from "../../../components/Posts/Share/SharePostBottomSheet";
import { Post } from "../../../features/posts/types";
import { useDiscover } from "../../../hooks/useDiscover";

const CATEGORIES = [
  "All",
  "Churches",
  "Ministries",
  "Pastors & Leaders",
  "Blogs",
  "Podcasts",
];

const DISCOVER_TABS = [
  { key: "accounts" as DiscoverTabType, label: "Accounts" },
  { key: "posts" as DiscoverTabType, label: "Posts" },
];

export default function Discover() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    accounts,
    posts,
    currentUser,
    isLoading,
    isFetching,
    handleToggleFollow,
    postActions,
    handleLoadMorePosts,
    handleRefresh,
    reportFlow,
    shareFlow,
  } = useDiscover();

  const handlePressProfile = useCallback((_accountId: string) => {
    router.push({
      pathname: "/profile",
      params: { userId: _accountId },
    });
  }, []);

  const keyExtractorAccount = useCallback((item: DiscoverAccount) => item.id, []);
  const keyExtractorPost = useCallback((item: Post) => item.id, []);

  const renderAccountItem = useCallback(
    ({ item }: { item: DiscoverAccount }) => (
      <DiscoverAccountCard
        account={item}
        onToggleFollow={() => handleToggleFollow(item)}
        onPressProfile={handlePressProfile}
      />
    ),
    [handleToggleFollow, handlePressProfile]
  );

  const renderPostItem = useCallback(
    ({ item }: { item: Post }) => (
      <View style={styles.postItemWrapper}>
        <FeedPostItem
          post={item}
          currentUser={currentUser}
          actions={postActions}
        />
      </View>
    ),
    [currentUser, postActions]
  );

  const renderEmptyAccounts = useCallback(() => {
    if (isLoading || isFetching) return null;
    return (
      <View style={styles.centeredState}>
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
          {searchQuery.trim()
            ? `No accounts found for "${searchQuery}".`
            : "No suggested accounts found."}
        </Text>
      </View>
    );
  }, [isLoading, isFetching, searchQuery, theme.colors.onSurfaceVariant]);

  const renderEmptyPosts = useCallback(() => {
    if (isLoading || isFetching) return null;
    return (
      <View style={styles.centeredState}>
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
          {searchQuery.trim()
            ? `No posts found for "${searchQuery}".`
            : "No trending posts found."}
        </Text>
      </View>
    );
  }, [isLoading, isFetching, searchQuery, theme.colors.onSurfaceVariant]);

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
      {/* Pinned Top Header */}
      <View style={styles.pinnedHeader}>
        <DiscoverSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Tabs
          tabs={DISCOVER_TABS}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          style={styles.tabsContainer}
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
          {searchQuery.trim()
            ? "Search results"
            : activeTab === "accounts"
            ? "Suggested for you"
            : "Trending posts"}
        </Text>
      </View>

      {/* Concurrent Lists with Preserved Scroll Positions */}
      <View style={styles.listsContainer}>
        {/* Accounts List */}
        <View
          style={[
            styles.tabListWrapper,
            { display: activeTab === "accounts" ? "flex" : "none" },
          ]}
        >
          {isLoading && accounts.length === 0 ? (
            <View style={styles.centeredState}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <FlatList
              data={accounts}
              keyExtractor={keyExtractorAccount}
              renderItem={renderAccountItem}
              ListEmptyComponent={renderEmptyAccounts}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={5}
              removeClippedSubviews={Platform.OS === "android"}
              refreshControl={
                <RefreshControl
                  refreshing={isFetching && accounts.length > 0}
                  onRefresh={handleRefresh}
                  tintColor={theme.colors.primary}
                />
              }
            />
          )}
        </View>

        {/* Posts List */}
        <View
          style={[
            styles.tabListWrapper,
            { display: activeTab === "posts" ? "flex" : "none" },
          ]}
        >
          {isLoading && posts.length === 0 ? (
            <View style={styles.centeredState}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <FlatList
              data={posts}
              keyExtractor={keyExtractorPost}
              renderItem={renderPostItem}
              ListEmptyComponent={renderEmptyPosts}
              onEndReached={handleLoadMorePosts}
              onEndReachedThreshold={0.5}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={5}
              removeClippedSubviews={Platform.OS === "android"}
              refreshControl={
                <RefreshControl
                  refreshing={isFetching && posts.length > 0}
                  onRefresh={handleRefresh}
                  tintColor={theme.colors.primary}
                />
              }
            />
          )}
        </View>
      </View>

      {/* Report Post Bottom Sheet */}
      <ReportPostSheet
        visible={Boolean(reportFlow.reportTarget)}
        onClose={reportFlow.closeReport}
        onSelectReason={reportFlow.submitReport}
      />

      {/* Share Post via DM Bottom Sheet */}
      <SharePostBottomSheet
        visible={shareFlow.isOpen}
        post={shareFlow.shareTarget}
        recipients={shareFlow.recipients}
        searchQuery={shareFlow.searchQuery}
        onChangeSearch={shareFlow.setSearchQuery}
        onClearSearch={shareFlow.handleClearSearch}
        onSelectRecipient={shareFlow.handleSelectRecipient}
        onClose={shareFlow.closeShareDM}
        onLoadMore={shareFlow.onLoadMore}
        isLoadingMore={shareFlow.isLoadingMore}
        hasMore={shareFlow.hasMore}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pinnedHeader: {
    paddingHorizontal: 16,
  },
  listsContainer: {
    flex: 1,
  },
  tabListWrapper: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  tabsContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  postItemWrapper: {
    marginBottom: 12,
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
