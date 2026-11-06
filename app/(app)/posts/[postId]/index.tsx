import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "react-native-paper";
import { useSelector } from "react-redux";

import { RootState } from "../../../../store/store";
import { globalStyles } from "../../../../assets/styles/theme";
import {
  CommentInput,
  CommentItem,
  CommentsHeader,
} from "../../../../components/Comments";
import { PostDetailHeader, PostImagePreviewModal } from "../../../../components/Posts/Detail";
import { FollowedUsersBottomSheet } from "../../../../components/Users";
import { ReportPostSheet } from "../../../../components/Posts/Report";
import { SharePostBottomSheet } from "../../../../components/Posts/Share";
import { InfiniteScrollList } from "../../../../components/InfiniteScrollList";
import { Comment } from "../../../../features/comments/types";
import { isPostOwnedBy, resolveActivityActor } from "../../../../features/posts/utils";
import { usePostComments } from "../../../../hooks/usePostComments";
import { useFeedPostActions } from "../../../../hooks/useFeedPostActions";
import { useReportPost } from "../../../../hooks/useReportPost";
import { useSharePostViaDM } from "../../../../hooks/useSharePostViaDM";

export default function PostDetailScreen() {
  const params = useLocalSearchParams<{ postId: string; commentId?: string }>();
  const postId = Array.isArray(params.postId) ? params.postId[0] : params.postId;
  const targetCommentId = Array.isArray(params.commentId)
    ? params.commentId[0]
    : params.commentId;

  const router = useRouter();
  const theme = useTheme();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const reportFlow = useReportPost();
  const shareFlow = useSharePostViaDM();
  const postActions = useFeedPostActions({
    onReport: reportFlow.openReport,
    onShareDM: shareFlow.openShareDM,
  });

  const {
    post,
    comments,
    currentUser: commentAuthor,
    draft,
    replyingTo,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    isRefreshing,
    isSubmitting,
    error,
    refresh,
    loadMore,
    selectReply,
    cancelReply,
    submitComment,
    likeComment,
    handleDraftChange,
    handleSelectionChange,
    isMentionSheetVisible,
    setIsMentionSheetVisible,
    handleSelectMention,
  } = usePostComments(postId ?? "");

  const isOwnPost = useMemo(
    () => (post ? isPostOwnedBy(post, currentUser) : false),
    [post, currentUser]
  );
  const resolvedActor = useMemo(
    () => (post ? resolveActivityActor(post.activityActor, currentUser?.name) : undefined),
    [post, currentUser]
  );

  const previewImages = useMemo(() => {
    if (post?.media && post.media.length > 0) {
      return post.media.map((item) => item.url).filter(Boolean);
    }
    return post?.imageUrl ? [post.imageUrl] : [];
  }, [post]);

  const renderPostHeader = useCallback(
    () => (
      <PostDetailHeader
        post={post}
        isOwnPost={isOwnPost}
        resolvedActor={resolvedActor}
        actions={postActions}
        onPressImageIndex={setPreviewIndex}
      />
    ),
    [isOwnPost, post, postActions, resolvedActor]
  );

  const renderComment = useCallback(
    ({ item }: { item: Comment }) => {
      const isTarget = Boolean(targetCommentId && item.id === targetCommentId);
      return (
        <View
          style={
            isTarget
              ? [
                  styles.highlightedComment,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.primary,
                  },
                ]
              : undefined
          }
        >
          <CommentItem
            comment={item}
            onLike={likeComment}
            onReply={selectReply}
          />
        </View>
      );
    },
    [likeComment, selectReply, targetCommentId, theme.colors]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[
        globalStyles.commentsScreen,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <CommentsHeader title="Post" onBack={() => router.back()} />

      <InfiniteScrollList<Comment>
        data={comments}
        ListHeaderComponent={renderPostHeader}
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
        initials={commentAuthor.initials}
        avatarUrl={commentAuthor.avatarUrl}
        isSubmitting={isSubmitting}
        replyingTo={replyingTo}
        onCancelReply={cancelReply}
        onChangeText={handleDraftChange}
        onSelectionChange={handleSelectionChange}
        onSubmit={submitComment}
      />

      <FollowedUsersBottomSheet
        visible={isMentionSheetVisible}
        onClose={() => setIsMentionSheetVisible(false)}
        onSelectUser={handleSelectMention}
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

      <PostImagePreviewModal
        images={previewImages}
        initialIndex={previewIndex ?? 0}
        visible={previewIndex !== null}
        onClose={() => setPreviewIndex(null)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  highlightedComment: {
    borderRadius: 8,
    borderWidth: 1.5,
    marginVertical: 4,
  },
});
