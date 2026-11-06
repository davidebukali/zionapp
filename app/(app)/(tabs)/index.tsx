import React, { useCallback, useRef } from "react";
import { FlatList, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSelector } from "react-redux";

import { RootState } from "../../../store/store";
import { globalStyles } from "../../../assets/styles/theme";
import { Post } from "../../../features/posts/types";
import { FeedPostItem, HomeFeedContent } from "../../../components/Posts/Feed";
import { ReportPostSheet } from "../../../components/Posts/Report";
import { SharePostBottomSheet } from "../../../components/Posts/Share";
import { useHomeFeed } from "../../../hooks/useHomeFeed";
import { useFeedPostActions } from "../../../hooks/useFeedPostActions";
import { useFeedNewPosts } from "../../../hooks/useFeedNewPosts";
import { useReportPost } from "../../../hooks/useReportPost";
import { useSharePostViaDM } from "../../../hooks/useSharePostViaDM";

export default function Index() {
  const theme = useTheme();
  const listRef = useRef<FlatList<Post>>(null);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const homeFeed = useHomeFeed();
  const reportFlow = useReportPost();
  const shareFlow = useSharePostViaDM();
  const postActions = useFeedPostActions({
    onReport: reportFlow.openReport,
    onShareDM: shareFlow.openShareDM,
  });

  const {
    newPostsCount,
    handlePressNewPosts,
    handlePullToRefresh,
  } = useFeedNewPosts({
    posts: homeFeed.posts,
    listRef,
    onRefresh: homeFeed.handleRefresh,
  });

  const renderPostItem = useCallback(
    ({ item }: { item: Post }) => (
      <FeedPostItem
        post={item}
        currentUser={currentUser}
        actions={postActions}
      />
    ),
    [currentUser, postActions]
  );

  return (
    <View
      style={[
        globalStyles.screen,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <HomeFeedContent
        {...homeFeed}
        listRef={listRef}
        renderPostItem={renderPostItem}
        onPullToRefresh={handlePullToRefresh}
        newPostsCount={newPostsCount}
        onPressNewPosts={handlePressNewPosts}
      />
      <ReportPostSheet
        visible={Boolean(reportFlow.reportTarget)}
        authorName={reportFlow.reportTarget?.author}
        onClose={reportFlow.closeReport}
        onSelectReason={reportFlow.submitReport}
      />
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
