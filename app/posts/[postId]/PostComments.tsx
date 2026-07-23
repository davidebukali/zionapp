import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { globalStyles } from "../../../assets/styles/theme";
import { CommentInput, CommentItem, CommentsHeader } from "../../../components/Comments";
import { InfiniteScrollList } from "../../../components/InfiniteScrollList";
import {
  addComment,
  Comment,
  fetchComments,
} from "../../../features/comments/commentSlice";
import {
  postsApi,
  useIncrementPostCommentCountMutation,
} from "../../../features/posts/postsApi";
import { AppDispatch, RootState } from "../../../store/store";

const currentUser = {
  author: "Alex Rivera",
  username: "alexr",
  initials: "AR",
  avatarColor: "#278CCB",
};

const COMMENTS_PAGE_SIZE = 10;
const selectCachedPosts = postsApi.endpoints.getPosts.select({ page: 1, limit: 3 });

export default function PostComments() {
  const params = useLocalSearchParams<{ postId: string; count?: string }>();
  const postId = Array.isArray(params.postId) ? params.postId[0] : params.postId;
  const fallbackCount = Array.isArray(params.count) ? params.count[0] : params.count;
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [incrementPostCommentCount] = useIncrementPostCommentCountMutation();
  const [draft, setDraft] = useState("");

  const comments = useSelector(
    (state: RootState) => state.comments.byPostId[postId] ?? []
  );
  const posts = useSelector((state: RootState) => selectCachedPosts(state).data);
  const post = posts?.find((item) => item.id === postId);
  const {
    loadingPostId,
    refreshingPostId,
    submittingPostId,
    pageByPostId,
    hasMoreByPostId,
    error,
  } = useSelector(
    (state: RootState) => state.comments
  );
  const isLoadingMore = loadingPostId === postId;
  const isRefreshing = refreshingPostId === postId;
  const isSubmitting = submittingPostId === postId;
  const page = pageByPostId[postId] ?? 0;
  const hasMore = hasMoreByPostId[postId] ?? true;
  const displayedCount = post?.comments ?? fallbackCount ?? "0";

  const handleRefresh = useCallback(async () => {
    if (postId) {
      await dispatch(
        fetchComments({
          postId,
          page: 1,
          limit: COMMENTS_PAGE_SIZE,
          isRefresh: true,
        })
      );
    }
  }, [dispatch, postId]);

  const handleLoadMore = useCallback(() => {
    if (postId && hasMore && !isLoadingMore && !isRefreshing) {
      dispatch(
        fetchComments({
          postId,
          page: page + 1,
          limit: COMMENTS_PAGE_SIZE,
        })
      );
    }
  }, [dispatch, hasMore, isLoadingMore, isRefreshing, page, postId]);

  useEffect(() => {
    void handleRefresh();
  }, [handleRefresh]);

  const handleSubmit = useCallback(async () => {
    const body = draft.trim();
    if (!body || isSubmitting || !postId) {
      return;
    }

    const result = await dispatch(
      addComment({
        postId,
        body,
        author: currentUser.author,
        username: currentUser.username,
        avatarColor: currentUser.avatarColor,
      })
    );

    if (addComment.fulfilled.match(result)) {
      setDraft("");
      await incrementPostCommentCount({
        postId,
        comments: displayedCount,
      });
    }
  }, [dispatch, displayedCount, draft, incrementPostCommentCount, isSubmitting, postId]);

  const renderComment = useCallback(
    ({ item }: { item: Comment }) => <CommentItem comment={item} />,
    []
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[globalStyles.commentsScreen, { backgroundColor: theme.colors.background }]}
    >
      <CommentsHeader count={displayedCount} onBack={() => router.back()} />
      <InfiniteScrollList<Comment>
        data={comments}
        renderItem={renderComment}
        onLoadMore={handleLoadMore}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        contentContainerStyle={globalStyles.commentsListContent}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={globalStyles.commentsCenteredState}>
            {isLoadingMore || isRefreshing ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Text
                style={[
                  globalStyles.commentsStateText,
                  { color: error ? theme.colors.error : theme.colors.onSurfaceVariant },
                ]}
              >
                {error ?? "No comments yet. Start the conversation."}
              </Text>
            )}
          </View>
        }
      />
      <CommentInput
        value={draft}
        initials={currentUser.initials}
        isSubmitting={isSubmitting}
        onChangeText={setDraft}
        onSubmit={handleSubmit}
      />
    </KeyboardAvoidingView>
  );
}
