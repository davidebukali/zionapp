import React, { useState } from "react";
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
import { deleteUserData } from "../../../features/auth/authSlice";
import { AppDispatch, RootState } from "../../../store/store";
import { getUserAvatarUrl } from "../../../utils/user";
import { useAppearance } from "../../../hooks/useAppearance";

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const user = useSelector((state: RootState) => state.auth.user);
  const { isDark, appearanceLabel, setDarkMode } = useAppearance();

  // Switch states
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [likesNotif, setLikesNotif] = useState(true);
  const [commentsNotif, setCommentsNotif] = useState(true);
  const [mentionsNotif, setMentionsNotif] = useState(true);
  const [repostsNotif, setRepostsNotif] = useState(true);
  const [followersNotif, setFollowersNotif] = useState(true);

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

  const formattedUser = user
    ? {
        name: user.name,
        username: user.profile?.username || user.email.split("@")[0],
        email: user.email,
        avatarUrl: getUserAvatarUrl(user),
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
            onPress={() => router.push("/profile")}
          />
          <SettingsToggleItem
            icon="lock-closed-outline"
            title="Private account"
            subtitle={isPrivateAccount ? "Private" : "Public"}
            value={isPrivateAccount}
            onValueChange={setIsPrivateAccount}
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
            onValueChange={setPushNotifications}
            showDivider
          />
          <SettingsToggleItem
            icon="heart-outline"
            title="Likes"
            value={likesNotif}
            onValueChange={setLikesNotif}
            showDivider
          />
          <SettingsToggleItem
            icon="chatbubble-outline"
            title="Comments"
            value={commentsNotif}
            onValueChange={setCommentsNotif}
            showDivider
          />
          <SettingsToggleItem
            icon="at-outline"
            title="Mentions"
            value={mentionsNotif}
            onValueChange={setMentionsNotif}
            showDivider
          />
          <SettingsToggleItem
            icon="repeat-outline"
            title="Reposts"
            value={repostsNotif}
            onValueChange={setRepostsNotif}
            showDivider
          />
          <SettingsToggleItem
            icon="person-add-outline"
            title="New followers"
            value={followersNotif}
            onValueChange={setFollowersNotif}
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
