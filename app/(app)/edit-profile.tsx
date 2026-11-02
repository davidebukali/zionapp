import React, { useCallback } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "react-native-paper";

import { globalStyles } from "../../assets/styles/theme";
import { EditProfileForm, EditProfileHeader } from "../../components/profile/edit";
import { Church } from "../../features/users/types";
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
    location,
    setLocation,
    accountType,
    setAccountType,
    category,
    setCategory,
    churchId,
    setChurchId,
    initialChurch,
    avatarUri,
    coverUri,
    initials,
    isSaving,
    isUploadingMedia,
    isUploadingCover,
    handlePickAvatar,
    handlePickCover,
    handleRemoveCover,
    handleSave,
    handleCancel,
  } = useEditProfile();

  const handleChangeClassification = useCallback(
    (type: "individual" | "organization", newCategory: string) => {
      setAccountType(type);
      setCategory(newCategory);
    },
    [setAccountType, setCategory]
  );

  const handleSelectChurch = useCallback(
    (church: Church | null) => {
      setChurchId(church ? church.id : null);
    },
    [setChurchId]
  );

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
            location={location}
            onChangeLocation={setLocation}
            website={website}
            onChangeWebsite={setWebsite}
            accountType={accountType}
            category={category}
            onChangeClassification={handleChangeClassification}
            selectedChurchId={churchId}
            initialChurch={initialChurch}
            onSelectChurch={handleSelectChurch}
            coverUri={coverUri}
            avatarUri={avatarUri}
            initials={initials}
            isUploadingCover={isUploadingCover}
            isUploadingAvatar={isUploadingMedia}
            onPickCover={handlePickCover}
            onRemoveCover={handleRemoveCover}
            onPickAvatar={handlePickAvatar}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
