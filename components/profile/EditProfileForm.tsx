import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

interface EditProfileFormProps {
  displayName: string;
  onChangeDisplayName: (val: string) => void;
  username: string;
  onChangeUsername: (val: string) => void;
  bio: string;
  onChangeBio: (val: string) => void;
  website: string;
  onChangeWebsite: (val: string) => void;
  avatarUri: string | null;
  initials: string;
  isUploadingMedia: boolean;
  onPickAvatar: () => void;
}

export function EditProfileForm({
  displayName,
  onChangeDisplayName,
  username,
  onChangeUsername,
  bio,
  onChangeBio,
  website,
  onChangeWebsite,
  avatarUri,
  initials,
  isUploadingMedia,
  onPickAvatar,
}: EditProfileFormProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Avatar Picker Section */}
      <View style={styles.avatarSection}>
        <TouchableOpacity
          onPress={onPickAvatar}
          disabled={isUploadingMedia}
          activeOpacity={0.8}
          style={styles.avatarButton}
          accessibilityRole="button"
          accessibilityLabel="Change profile picture"
        >
          <View
            style={[
              styles.avatarContainer,
              {
                backgroundColor: theme.dark ? "#4A1717" : "#7A1C1C",
                borderColor: theme.colors.outlineVariant,
              },
            ]}
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarInitials}>{initials}</Text>
            )}

            {isUploadingMedia && (
              <View style={styles.avatarLoadingOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}
          </View>

          <View
            style={[
              styles.cameraBadge,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPickAvatar}
          disabled={isUploadingMedia}
          style={styles.changePhotoTextButton}
        >
          <Text
            style={[styles.changePhotoText, { color: theme.colors.primary }]}
          >
            {isUploadingMedia ? "Uploading photo..." : "Change profile photo"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View style={styles.fieldsContainer}>
        {/* Display Name */}
        <View style={styles.fieldGroup}>
          <Text
            style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Name
          </Text>
          <TextInput
            value={displayName}
            onChangeText={onChangeDisplayName}
            placeholder="Your name"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.surfaceVariant,
                color: theme.colors.onSurface,
                borderColor: theme.colors.outlineVariant,
              },
            ]}
          />
        </View>

        {/* Username */}
        <View style={styles.fieldGroup}>
          <Text
            style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Username
          </Text>
          <TextInput
            value={username}
            onChangeText={onChangeUsername}
            placeholder="username"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.surfaceVariant,
                color: theme.colors.onSurface,
                borderColor: theme.colors.outlineVariant,
              },
            ]}
          />
        </View>

        {/* Bio */}
        <View style={styles.fieldGroup}>
          <Text
            style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Bio
          </Text>
          <TextInput
            value={bio}
            onChangeText={onChangeBio}
            placeholder="A short bio about yourself..."
            multiline
            numberOfLines={4}
            maxLength={1000}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            style={[
              styles.textInput,
              styles.textArea,
              {
                backgroundColor: theme.colors.surfaceVariant,
                color: theme.colors.onSurface,
                borderColor: theme.colors.outlineVariant,
              },
            ]}
          />
        </View>

        {/* Website */}
        <View style={styles.fieldGroup}>
          <Text
            style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Website
          </Text>
          <TextInput
            value={website}
            onChangeText={onChangeWebsite}
            placeholder="https://yourwebsite.com"
            autoCapitalize="none"
            keyboardType="url"
            autoCorrect={false}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.surfaceVariant,
                color: theme.colors.onSurface,
                borderColor: theme.colors.outlineVariant,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatarButton: {
    position: "relative",
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
  },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  changePhotoTextButton: {
    marginTop: 10,
    paddingVertical: 4,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: "700",
  },
  fieldsContainer: {
    gap: 18,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: 2,
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: "top",
  },
});

