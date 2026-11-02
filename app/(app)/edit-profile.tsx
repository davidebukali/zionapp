import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "react-native-paper";

import { globalStyles } from "../../assets/styles/theme";
import { EditProfileForm, EditProfileHeader } from "../../components/profile";
import { useEditProfile } from "../../hooks/useEditProfile";

export default function EditProfileScreen() {
  const theme = useTheme();
  const {
    displayName,
    setDisplayName,
    username,
    setUsername,
    bio,
    setBio,
    website,
    setWebsite,
    avatarUri,
    initials,
    isSaving,
    isUploadingMedia,
    handlePickAvatar,
    handleSave,
    handleCancel,
  } = useEditProfile();

  return (
    <View
      style={[
        globalStyles.screen,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <StatusBar
        backgroundColor={theme.colors.surface}
        style={theme.dark ? "light" : "dark"}
      />

      <EditProfileHeader
        isSaving={isSaving}
        onCancel={handleCancel}
        onSave={handleSave}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <EditProfileForm
            displayName={displayName}
            onChangeDisplayName={setDisplayName}
            username={username}
            onChangeUsername={setUsername}
            bio={bio}
            onChangeBio={setBio}
            website={website}
            onChangeWebsite={setWebsite}
            avatarUri={avatarUri}
            initials={initials}
            isUploadingMedia={isUploadingMedia}
            onPickAvatar={handlePickAvatar}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

