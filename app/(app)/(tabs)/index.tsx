import React, { useCallback, useRef } from "react";
import { FlatList, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSelector } from "react-redux";

import { RootState } from "../../../store/store";
import { globalStyles } from "../../../assets/styles/theme";
import { Post } from "../../../features/posts/types";
import { FeedPostItem, HomeFeedContent } from "../../../components/Posts/Feed";
import { useHomeFeed } from "../../../hooks/useHomeFeed";
import { useFeedPostActions } from "../../../hooks/useFeedPostActions";
import { useFeedNewPosts } from "../../../hooks/useFeedNewPosts";

export default function Index() {
  const theme = useTheme();
  const listRef = useRef<FlatList<Post>>(null);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const homeFeed = useHomeFeed();
  const postActions = useFeedPostActions();

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
    </View>
  );
}
