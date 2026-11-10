import React, { useState, useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Snackbar, useTheme } from "react-native-paper";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import {
  SettingsFooter,
  SettingsNavItem,
  SettingsSection,
  SettingsToggleItem,
  SettingsUserCard,
} from "../../../components/settings";
import { deleteUserData, setUser } from "../../../features/auth/authSlice";
import { useGetMeQuery } from "../../../features/auth/api";
import { useUpdateProfileMutation } from "../../../features/users/api";
import {
  loadNotificationPreferences,
  saveNotificationPreferences,
} from "../../../features/notifications/utils";
import { AppDispatch, RootState } from "../../../store/store";
import { getUserAvatarUrl } from "../../../utils/user";
import { useAppearance } from "../../../hooks/useAppearance";

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: meData } = useGetMeQuery();
  const [updateProfile] = useUpdateProfileMutation();
  const { isDark, appearanceLabel, setDarkMode } = useAppearance();

  const activeUser = meData?.resource || meData?.data || user;
  const activeProfile = activeUser?.profile;

  // Switch states
  const [isPrivateAccount, setIsPrivateAccount] = useState(
    Boolean(activeProfile?.is_private)
  );

  useEffect(() => {
    if (activeProfile?.is_private !== undefined) {
      setIsPrivateAccount(Boolean(activeProfile.is_private));
    }
  }, [activeProfile?.is_private]);

  const [pushNotifications, setPushNotifications] = useState(true);
  const [likesNotif, setLikesNotif] = useState(true);
  const [commentsNotif, setCommentsNotif] = useState(true);
  const [mentionsNotif, setMentionsNotif] = useState(true);
  const [repostsNotif, setRepostsNotif] = useState(true);
  const [followersNotif, setFollowersNotif] = useState(true);

  // Cached subordinate preferences for restoring when push notifications is re-enabled
  const cachedSubordinatesRef = useRef({
    likes: true,
    comments: true,
    mentions: true,
    reposts: true,
    followers: true,
  });

  useEffect(() => {
    let isMounted = true;
    async function initNotificationPreferences() {
      const preferences = await loadNotificationPreferences();
      if (!isMounted) return;

      setPushNotifications(preferences.pushNotifications);
      setLikesNotif(preferences.likes);
      setCommentsNotif(preferences.comments);
      setMentionsNotif(preferences.mentions);
      setRepostsNotif(preferences.reposts);
      setFollowersNotif(preferences.followers);

      // Keep cache initialized with the preferences
      cachedSubordinatesRef.current = {
        likes: preferences.likes,
        comments: preferences.comments,
        mentions: preferences.mentions,
        reposts: preferences.reposts,
        followers: preferences.followers,
      };
    }

    initNotificationPreferences();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTogglePushNotifications = (enabled: boolean) => {
    setPushNotifications(enabled);

    if (!enabled) {
      // Remember current subordinate values before switching off
      cachedSubordinatesRef.current = {
        likes: likesNotif,
        comments: commentsNotif,
        mentions: mentionsNotif,
        reposts: repostsNotif,
        followers: followersNotif,
      };

      setLikesNotif(false);
      setCommentsNotif(false);
      setMentionsNotif(false);
      setRepostsNotif(false);
      setFollowersNotif(false);

      saveNotificationPreferences({
        pushNotifications: false,
        likes: false,
        comments: false,
        mentions: false,
        reposts: false,
        followers: false,
      });
    } else {
      // Restore previously saved subordinate values
      const restored = cachedSubordinatesRef.current;
      setLikesNotif(restored.likes);
      setCommentsNotif(restored.comments);
      setMentionsNotif(restored.mentions);
      setRepostsNotif(restored.reposts);
      setFollowersNotif(restored.followers);

      saveNotificationPreferences({
        pushNotifications: true,
        ...restored,
      });
    }
  };

  const handleToggleLikes = (enabled: boolean) => {
    setLikesNotif(enabled);
    cachedSubordinatesRef.current.likes = enabled;
    saveNotificationPreferences({
      pushNotifications,
      likes: enabled,
      comments: commentsNotif,
      mentions: mentionsNotif,
      reposts: repostsNotif,
      followers: followersNotif,
    });
  };

  const handleToggleComments = (enabled: boolean) => {
    setCommentsNotif(enabled);
    cachedSubordinatesRef.current.comments = enabled;
    saveNotificationPreferences({
      pushNotifications,
      likes: likesNotif,
      comments: enabled,
      mentions: mentionsNotif,
      reposts: repostsNotif,
      followers: followersNotif,
    });
  };

  const handleToggleMentions = (enabled: boolean) => {
    setMentionsNotif(enabled);
    cachedSubordinatesRef.current.mentions = enabled;
    saveNotificationPreferences({
      pushNotifications,
      likes: likesNotif,
      comments: commentsNotif,
      mentions: enabled,
      reposts: repostsNotif,
      followers: followersNotif,
    });
  };

  const handleToggleReposts = (enabled: boolean) => {
    setRepostsNotif(enabled);
    cachedSubordinatesRef.current.reposts = enabled;
    saveNotificationPreferences({
      pushNotifications,
      likes: likesNotif,
      comments: commentsNotif,
      mentions: mentionsNotif,
      reposts: enabled,
      followers: followersNotif,
    });
  };

  const handleToggleFollowers = (enabled: boolean) => {
    setFollowersNotif(enabled);
    cachedSubordinatesRef.current.followers = enabled;
    saveNotificationPreferences({
      pushNotifications,
      likes: likesNotif,
      comments: commentsNotif,
      mentions: mentionsNotif,
      reposts: repostsNotif,
      followers: enabled,
    });
  };

  // Toast state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleLogout = () => {
    dispatch(deleteUserData());
  };

  const handleCopySuccess = (text: string) => {
    setSnackbarMessage("Build info copied to clipboard");
    setSnackbarVisible(true);
  };

  const handleTogglePrivacy = async (newValue: boolean) => {
    const previousValue = isPrivateAccount;
    setIsPrivateAccount(newValue);
    try {
      const updatedProfile = await updateProfile({ is_private: newValue }).unwrap();
      if (activeUser) {
        dispatch(
          setUser({
            ...activeUser,
            profile: {
              ...activeProfile,
              ...updatedProfile,
              is_private: newValue,
            },
          })
        );
      }
    } catch {
      setIsPrivateAccount(previousValue);
      setSnackbarMessage("Failed to update account privacy. Please try again.");
      setSnackbarVisible(true);
    }
  };

  const formattedUser = activeUser
    ? {
        name: activeUser.name,
        username: activeProfile?.username || activeUser.email.split("@")[0],
        email: activeUser.email,
        avatarUrl: getUserAvatarUrl(activeUser),
      }
    : null;

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.screenTitle,
            { color: theme.colors.onBackground },
          ]}
        >
          Settings
        </Text>

        <SettingsUserCard
          user={formattedUser}
          onPressManage={() => router.push("/profile")}
        />

        <SettingsSection title="ACCOUNT">
          <SettingsNavItem
            icon="person-outline"
            title="Edit profile"
            showDivider
            onPress={() => router.push("/edit-profile")}
          />
          <SettingsToggleItem
            icon="lock-closed-outline"
            title="Account Privacy"
            subtitle={isPrivateAccount ? "Private" : "Public"}
            value={isPrivateAccount}
            onValueChange={handleTogglePrivacy}
            showDivider
          />
          <SettingsNavItem
            icon="shield-outline"
            title="Security"
            showDivider
            onPress={() => {}}
          />
          <SettingsToggleItem
            icon="bulb-outline"
            title="Appearance"
            subtitle={appearanceLabel}
            value={isDark}
            onValueChange={setDarkMode}
          />
        </SettingsSection>

        <SettingsSection title="NOTIFICATIONS">
          <SettingsToggleItem
            icon="notifications-outline"
            title="Push notifications"
            value={pushNotifications}
            onValueChange={handleTogglePushNotifications}
            showDivider
          />
          <SettingsToggleItem
            icon="heart-outline"
            title="Likes"
            value={likesNotif}
            onValueChange={handleToggleLikes}
            disabled={!pushNotifications}
            showDivider
          />
          <SettingsToggleItem
            icon="chatbubble-outline"
            title="Comments"
            value={commentsNotif}
            onValueChange={handleToggleComments}
            disabled={!pushNotifications}
            showDivider
          />
          <SettingsToggleItem
            icon="at-outline"
            title="Mentions"
            value={mentionsNotif}
            onValueChange={handleToggleMentions}
            disabled={!pushNotifications}
            showDivider
          />
          <SettingsToggleItem
            icon="repeat-outline"
            title="Reposts"
            value={repostsNotif}
            onValueChange={handleToggleReposts}
            disabled={!pushNotifications}
            showDivider
          />
          <SettingsToggleItem
            icon="person-add-outline"
            title="New followers"
            value={followersNotif}
            onValueChange={handleToggleFollowers}
            disabled={!pushNotifications}
          />
        </SettingsSection>

        <SettingsSection title="SUPPORT">
          <SettingsNavItem
            icon="chatbubble-ellipses-outline"
            title="Contact developers"
            showDivider
            onPress={() => {}}
          />
          <SettingsNavItem
            icon="document-text-outline"
            title="Terms of service"
            showDivider
            onPress={() => {}}
          />
          <SettingsNavItem
            icon="document-lock-outline"
            title="Privacy policy"
            showDivider
            onPress={() => {}}
          />
          <SettingsNavItem
            icon="people-outline"
            title="Community guidelines"
            onPress={() => {}}
          />
        </SettingsSection>

        <SettingsSection>
          <SettingsNavItem
            icon="log-out-outline"
            title="Log out"
            isDestructive
            onPress={handleLogout}
          />
        </SettingsSection>

        <SettingsFooter onCopySuccess={handleCopySuccess} />
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 18,
    marginTop: 4,
  },
  snackbar: {
    marginBottom: 16,
  },
});
