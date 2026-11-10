import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useSelector } from "react-redux";
import { router, useLocalSearchParams } from "expo-router";

import type { RootState } from "../store/store";
import { useGetMeQuery } from "../features/auth/api";
import {
  useBlockUserMutation,
  useFollowUserMutation,
  useGetUserFollowersCountQuery,
  useGetUserFollowingCountQuery,
  useGetUserPostsQuery,
  useGetUserProfileQuery,
  useReportUserMutation,
  useUnblockUserMutation,
  useUnfollowUserMutation,
} from "../features/users/api";
import { normalizeUserProfile } from "../features/users/utils";
import type { ReportReasonId } from "../features/users/types";
import {
  useToggleBookmarkPostMutation,
  useToggleLikePostMutation,
  useToggleRepostPostMutation,
} from "../features/posts/api";
import { ProfileTabType } from "../components/profile/types";

export function useUserProfile() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [activeTab, setActiveTab] = useState<ProfileTabType>("posts");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // More menu, reporting, and blocking state
  const [isMoreMenuVisible, setIsMoreMenuVisible] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isReportSheetVisible, setIsReportSheetVisible] = useState(false);
  const [localBlockedState, setLocalBlockedState] = useState<boolean | null>(null);

  const isOwnProfile = useMemo(() => {
    if (!userId) return true;
    if (!currentUser?.id) return false;
    return String(userId) === String(currentUser.id);
  }, [userId, currentUser?.id]);

  const targetUserId = useMemo(() => {
    if (isOwnProfile) {
      return currentUser?.id ? String(currentUser.id) : "";
    }
    return String(userId || "");
  }, [isOwnProfile, currentUser?.id, userId]);

  // Own profile query
  const {
    data: meData,
    isLoading: isMeLoading,
    refetch: refetchMe,
  } = useGetMeQuery(undefined, {
    skip: !isOwnProfile,
  });

  // Other profile query
  const {
    data: otherProfileData,
    isLoading: isOtherProfileLoading,
    refetch: refetchOtherProfile,
  } = useGetUserProfileQuery(targetUserId, {
    skip: isOwnProfile || !targetUserId,
  });

  // Follower counts
  const {
    data: followersData,
    refetch: refetchFollowers,
  } = useGetUserFollowersCountQuery(targetUserId, {
    skip: !targetUserId,
  });

  const {
    data: followingData,
    refetch: refetchFollowing,
  } = useGetUserFollowingCountQuery(targetUserId, {
    skip: !targetUserId,
  });

  // User posts
  const {
    data: postsData,
    isLoading: isPostsLoading,
    refetch: refetchPosts,
  } = useGetUserPostsQuery(
    { userId: targetUserId },
    { skip: !targetUserId }
  );

  // Follow / Unfollow mutations
  const [followUser, { isLoading: isFollowLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowLoading }] = useUnfollowUserMutation();

  // Block / Unblock mutations
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const [unblockUser, { isLoading: isUnblocking }] = useUnblockUserMutation();

  // Report user mutation
  const [reportUser, { isLoading: isSubmittingReport }] = useReportUserMutation();

  // Post action mutations
  const [toggleLikePost] = useToggleLikePostMutation();
  const [toggleRepostPost] = useToggleRepostPostMutation();
  const [toggleBookmarkPost] = useToggleBookmarkPostMutation();

  // Normalized Profile Data
  const profile = useMemo(() => {
    if (isOwnProfile) {
      const activeMeUser = meData?.resource || meData?.data || currentUser;
      const activeMeProfile =
        meData?.resource?.profile ||
        meData?.data?.profile ||
        currentUser?.profile;

      return normalizeUserProfile(
        activeMeProfile as any,
        activeMeUser as any,
        {
          followers: followersData?.total ?? 0,
          following: followingData?.total ?? 0,
        }
      );
    }

    return normalizeUserProfile(
      otherProfileData,
      null,
      {
        followers: followersData?.total ?? 0,
        following: followingData?.total ?? 0,
      }
    );
  }, [
    isOwnProfile,
    meData,
    currentUser,
    otherProfileData,
    followersData?.total,
    followingData?.total,
  ]);

  const isBlocked =
    localBlockedState !== null
      ? localBlockedState
      : Boolean(profile.isBlocked);

  const isLoading = isOwnProfile
    ? isMeLoading && !currentUser
    : isOtherProfileLoading;

  const handleToggleFollow = useCallback(async () => {
    if (!targetUserId || isOwnProfile) return;
    try {
      if (profile.isFollowing) {
        await unfollowUser({ userId: targetUserId }).unwrap();
      } else {
        await followUser({ userId: targetUserId }).unwrap();
      }
    } catch {
      Alert.alert("Error", "Could not update follow status. Please try again.");
    }
  }, [targetUserId, isOwnProfile, profile.isFollowing, unfollowUser, followUser]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const promises: Array<Promise<any>> = [];
      if (isOwnProfile) {
        promises.push(refetchMe());
      } else if (targetUserId) {
        promises.push(refetchOtherProfile());
      }
      if (targetUserId) {
        promises.push(refetchFollowers());
        promises.push(refetchFollowing());
        promises.push(refetchPosts());
      }
      await Promise.all(promises);
    } catch {
      // Ignore refresh error
    } finally {
      setIsRefreshing(false);
    }
  }, [
    isOwnProfile,
    targetUserId,
    refetchMe,
    refetchOtherProfile,
    refetchFollowers,
    refetchFollowing,
    refetchPosts,
  ]);

  const handlePressBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)/(tabs)");
    }
  }, []);

  const handlePressEditProfile = useCallback(() => {
    router.push("/edit-profile");
  }, []);

  const handlePressMessage = useCallback(() => {
    Alert.alert(
      "Direct Messages",
      `Direct messaging with @${profile.username} will be available soon!`
    );
  }, [profile.username]);

  const handleOpenMoreMenu = useCallback(
    (position?: { x: number; y: number; width: number; height: number }) => {
      setAnchorPosition(position || null);
      setIsMoreMenuVisible(true);
    },
    []
  );

  const handleCloseMoreMenu = useCallback(() => {
    setIsMoreMenuVisible(false);
  }, []);

  const handleOpenReport = useCallback(() => {
    setIsMoreMenuVisible(false);
    setIsReportSheetVisible(true);
  }, []);

  const handleCloseReport = useCallback(() => {
    setIsReportSheetVisible(false);
  }, []);

  const handleConfirmBlock = useCallback(async () => {
    if (!targetUserId) return;
    try {
      await blockUser(targetUserId).unwrap();
      setLocalBlockedState(true);
      Alert.alert("Blocked", `@${profile.username} has been blocked.`);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || "Failed to block user. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  }, [targetUserId, profile.username, blockUser]);

  const handleUnblockPress = useCallback(async () => {
    if (!targetUserId) return;
    try {
      await unblockUser(targetUserId).unwrap();
      setLocalBlockedState(false);
      Alert.alert("Unblocked", `@${profile.username} has been unblocked.`);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || "Failed to unblock user. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  }, [targetUserId, profile.username, unblockUser]);

  const handleBlockPress = useCallback(() => {
    setIsMoreMenuVisible(false);
    if (isBlocked) {
      handleUnblockPress();
      return;
    }
    Alert.alert(
      `Block @${profile.username}?`,
      "They won't be able to view your profile, see your posts, or message you.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: handleConfirmBlock,
        },
      ]
    );
  }, [isBlocked, profile.username, handleConfirmBlock, handleUnblockPress]);

  const handleSubmitReport = useCallback(
    async (reason: ReportReasonId, description: string) => {
      if (!targetUserId) return;
      try {
        await reportUser({
          userId: targetUserId,
          payload: {
            reason,
            description: description.trim() ? description.trim() : null,
          },
        }).unwrap();
        setIsReportSheetVisible(false);

        // Follow-up alert offering quick block
        Alert.alert(
          "Thank You",
          `We received your report and our team will review it.\n\nWould you also like to block @${profile.username}?`,
          [
            { text: "No", style: "cancel" },
            {
              text: "Block User",
              style: "destructive",
              onPress: handleConfirmBlock,
            },
          ]
        );
      } catch (error: any) {
        const errorMessage =
          error?.data?.message || "Failed to submit report. Please try again.";
        Alert.alert("Error", errorMessage);
      }
    },
    [targetUserId, reportUser, profile.username, handleConfirmBlock]
  );

  const handleLikePost = useCallback(
    (postId: string, liked: boolean) => {
      toggleLikePost({ postId, liked });
    },
    [toggleLikePost]
  );

  const handleRepostPost = useCallback(
    (postId: string) => {
      const targetPost = postsData?.posts.find(
        (postItem) => postItem.id === postId
      );
      toggleRepostPost({
        postId,
        reposted: Boolean(targetPost?.isReposted ?? targetPost?.reposted),
      });
    },
    [postsData?.posts, toggleRepostPost]
  );

  const handleBookmarkPost = useCallback(
    (postId: string) => {
      const targetPost = postsData?.posts.find(
        (postItem) => postItem.id === postId
      );
      toggleBookmarkPost({
        postId,
        bookmarked: Boolean(targetPost?.isBookmarked ?? targetPost?.bookmarked),
      });
    },
    [postsData?.posts, toggleBookmarkPost]
  );

  return {
    profile,
    isOwnProfile,
    isLoading,
    isRefreshing,
    isFollowLoading: isFollowLoading || isUnfollowLoading,
    activeTab,
    setActiveTab,
    posts: postsData?.posts || [],
    isPostsLoading,
    currentUserId: currentUser?.id,
    isBlocked,
    isBlocking,
    isUnblocking,
    isSubmittingReport,
    isMoreMenuVisible,
    anchorPosition,
    isReportSheetVisible,
    handleToggleFollow,
    handleRefresh,
    handlePressBack,
    handlePressEditProfile,
    handlePressMessage,
    handleOpenMoreMenu,
    handleCloseMoreMenu,
    handleBlockPress,
    handleUnblockPress,
    handleOpenReport,
    handleCloseReport,
    handleSubmitReport,
    handleLikePost,
    handleRepostPost,
    handleBookmarkPost,
  };
}
