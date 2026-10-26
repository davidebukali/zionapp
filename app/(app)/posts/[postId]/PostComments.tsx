import { useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";

import { globalStyles } from "../../../../assets/styles/theme";
import {
  CommentInput,
  CommentItem,
  CommentsHeader,
} from "../../../../components/Comments";
import { InfiniteScrollList } from "../../../../components/InfiniteScrollList";
import { Comment } from "../../../../features/comments/types";
import { usePostComments } from "../../../../hooks/usePostComments";

export default function PostComments() {
  const params = useLocalSearchParams<{ postId: string; count?: string }>();
  const postId = Array.isArray(params.postId) ? params.postId[0] : params.postId;
  const router = useRouter();
  const theme = useTheme();

  const {
    comments,
    displayedCount,
    currentUser,
    draft,
    setDraft,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    isRefreshing,
    isSubmitting,
    error,
    refresh,
    loadMore,
    submitComment,
    likeComment,
  } = usePostComments(postId ?? "");

  const renderComment = useCallback(
    ({ item }: { item: Comment }) => (
      <CommentItem comment={item} onLike={likeComment} />
    ),
    [likeComment]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[
        globalStyles.commentsScreen,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <CommentsHeader
        count={displayedCount}
        onBack={() => router.back()}
      />
      <InfiniteScrollList<Comment>
        data={comments}
        renderItem={renderComment}
        onLoadMore={loadMore}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onRefresh={refresh}
        isRefreshing={isRefreshing}
        contentContainerStyle={globalStyles.commentsListContent}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={globalStyles.commentsCenteredState}>
            {isInitialLoading || isRefreshing ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Text
                style={[
                  globalStyles.commentsStateText,
                  {
                    color: error
                      ? theme.colors.error
                      : theme.colors.onSurfaceVariant,
                  },
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
        avatarUrl={currentUser.avatarUrl}
        isSubmitting={isSubmitting}
        onChangeText={setDraft}
        onSubmit={submitComment}
      />
    </KeyboardAvoidingView>
  );
}
