import React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "react-native-paper";

import { globalStyles } from "../../assets/styles/theme";
import {
  ProfileFeed,
  ProfileHeader,
  ProfileInfo,
  ProfileSkeleton,
  ProfileTabs,
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
    handleToggleFollow,
    handleRefresh,
    handlePressBack,
    handlePressEditProfile,
    handlePressMessage,
    handleLikePost,
    handleRepostPost,
    handleBookmarkPost,
  } = useUserProfile();

  if (isLoading) {
    return (
      <View
        style={[
          globalStyles.screen,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <StatusBar
          translucent
          backgroundColor="transparent"
          style={theme.dark ? "light" : "dark"}
        />
        <ProfileSkeleton />
      </View>
    );
  }

  return (
    <View
      style={[
        globalStyles.screen,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        style="light"
      />

      <FlatList
        data={activeTab === "posts" ? posts : []}
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
            />
            <ProfileInfo profile={profile} />
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
    </View>
  );
}
