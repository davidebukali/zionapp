import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { EditProfileBanner } from "./EditProfileBanner";
import { ProfileInputField } from "./ProfileInputField";
import { AccountClassificationCardRow } from "./AccountClassificationCardRow";
import { AccountClassificationBottomSheet } from "./AccountClassificationBottomSheet";
import { ChurchDropdownSelector } from "./ChurchDropdownSelector";
import { EditProfileFormProps } from "./types";

export function EditProfileForm({
  displayName,
  onChangeDisplayName,
  username,
  onChangeUsername,
  bio,
  onChangeBio,
  location,
  onChangeLocation,
  website,
  onChangeWebsite,
  accountType,
  category,
  onChangeClassification,
  selectedChurchId,
  initialChurch,
  onSelectChurch,
  coverUri,
  avatarUri,
  initials,
  isUploadingCover,
  isUploadingAvatar,
  onPickCover,
  onRemoveCover,
  onPickAvatar,
}: EditProfileFormProps) {
  const [sheetVisible, setSheetVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* 1. Cover Photo Banner & Overlapping Avatar */}
      <EditProfileBanner
        coverUri={coverUri}
        avatarUri={avatarUri}
        initials={initials}
        isUploadingCover={isUploadingCover}
        isUploadingAvatar={isUploadingAvatar}
        onPickCover={onPickCover}
        onRemoveCover={onRemoveCover}
        onPickAvatar={onPickAvatar}
      />

      <View style={styles.fieldsContainer}>
        {/* 2. Display Name */}
        <ProfileInputField
          label="Name"
          value={displayName}
          onChangeText={onChangeDisplayName}
          placeholder="Your name"
        />

        {/* 3. Username */}
        <ProfileInputField
          label="Username"
          value={username}
          onChangeText={onChangeUsername}
          placeholder="username"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* 4. Bio */}
        <ProfileInputField
          label="Bio"
          value={bio}
          onChangeText={onChangeBio}
          placeholder="A short bio about yourself..."
          multiline
          numberOfLines={4}
          maxLength={1000}
        />

        {/* 5. Location */}
        <ProfileInputField
          label="Location"
          value={location}
          onChangeText={onChangeLocation}
          placeholder="e.g. Kampala, Uganda"
        />

        {/* 6. Website */}
        <ProfileInputField
          label="Website"
          value={website}
          onChangeText={onChangeWebsite}
          placeholder="https://yourwebsite.com"
          autoCapitalize="none"
          keyboardType="url"
          autoCorrect={false}
        />

        {/* 7. Account Classification */}
        <AccountClassificationCardRow
          accountType={accountType}
          category={category}
          onPressCard={(_type) => setSheetVisible(true)}
        />

        {/* 8. Church Affiliation Dropdown */}
        <ChurchDropdownSelector
          selectedChurchId={selectedChurchId}
          initialChurch={initialChurch}
          onSelectChurch={(church) => onSelectChurch(church)}
        />
      </View>

      {/* Account Classification Bottom Sheet */}
      <AccountClassificationBottomSheet
        visible={sheetVisible}
        initialAccountType={accountType}
        initialCategory={category}
        onClose={() => setSheetVisible(false)}
        onConfirm={onChangeClassification}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  fieldsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
});

