import React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "react-native-paper";

import { globalStyles } from "../../assets/styles/theme";
import {
  BlockedProfileNotice,
  ProfileFeed,
  ProfileHeader,
  ProfileInfo,
  ProfileMoreMenu,
  ProfileSkeleton,
  ProfileTabs,
  ReportUserSheet,
} from "../../components/profile";
import { useUserProfile } from "../../hooks/useUserProfile";

export default function ProfileScreen() {
  const theme = useTheme();
  const {
    profile,
    isOwnProfile,
    isLoading,
    isRefreshing,
    isFollowLoading,
    activeTab,
    setActiveTab,
    posts,
    isPostsLoading,
    currentUserId,
    isBlocked,
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
  } = useUserProfile();

  if (isLoading) {
    return (
      <View style={[globalStyles.screen, { backgroundColor: theme.colors.background }]}>
        <StatusBar translucent backgroundColor="transparent" style={theme.dark ? "light" : "dark"} />
        <ProfileSkeleton />
      </View>
    );
  }

  return (
    <View style={[globalStyles.screen, { backgroundColor: theme.colors.background }]}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <FlatList
        data={!isBlocked && activeTab === "posts" ? posts : []}
        keyExtractor={(item) => String(item.id)}
        renderItem={null}
        ListHeaderComponent={
          <>
            <ProfileHeader
              profile={profile}
              isOwnProfile={isOwnProfile}
              isFollowing={profile.isFollowing}
              isFollowLoading={isFollowLoading}
              onPressBack={handlePressBack}
              onPressEditProfile={handlePressEditProfile}
              onPressMessage={handlePressMessage}
              onPressToggleFollow={handleToggleFollow}
              onPressMoreMenu={handleOpenMoreMenu}
            />
            <ProfileInfo profile={profile} />

            {isBlocked ? (
              <BlockedProfileNotice
                username={profile.username}
                isUnblocking={isUnblocking}
                onPressUnblock={handleUnblockPress}
              />
            ) : (
              <>
                <ProfileTabs activeTab={activeTab} onSelectTab={setActiveTab} />
                <ProfileFeed
                  activeTab={activeTab}
                  posts={posts}
                  isPostsLoading={isPostsLoading}
                  currentUserId={currentUserId}
                  onLikePost={handleLikePost}
                  onRepostPost={handleRepostPost}
                  onBookmarkPost={handleBookmarkPost}
                />
              </>
            )}
          </>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <ProfileMoreMenu
        visible={isMoreMenuVisible}
        anchorPosition={anchorPosition}
        username={profile.username}
        isBlocked={isBlocked}
        onClose={handleCloseMoreMenu}
        onPressBlockToggle={handleBlockPress}
        onPressReport={handleOpenReport}
      />

      <ReportUserSheet
        visible={isReportSheetVisible}
        username={profile.username}
        isSubmitting={isSubmittingReport}
        onClose={handleCloseReport}
        onSubmit={handleSubmitReport}
      />
    </View>
  );
}
