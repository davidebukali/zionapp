import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import type { AppDispatch, RootState } from "../store/store";
import { useGetMeQuery } from "../features/auth/api";
import { setUser } from "../features/auth/authSlice";
import { useUpdateProfileMutation } from "../features/users/api";
import {
  useConfirmMediaUploadMutation,
  useGetMediaUploadUrlMutation,
} from "../features/posts/api";
import { uploadSingleMedia } from "../utils/mediaUploader";
import { getUserAvatarUrl, getUserInitials } from "../utils/user";

export function useEditProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const { data: meData, refetch: refetchMe } = useGetMeQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [getMediaUploadUrl] = useGetMediaUploadUrlMutation();
  const [confirmMediaUpload] = useConfirmMediaUploadMutation();

  const activeUser = meData?.resource || meData?.data || currentUser;
  const activeProfile =
    meData?.resource?.profile ||
    meData?.data?.profile ||
    currentUser?.profile;

  const [displayName, setDisplayName] = useState(
    activeProfile?.display_name || activeUser?.name || ""
  );
  const [username, setUsername] = useState(
    activeProfile?.username ||
      activeUser?.name?.toLowerCase().replace(/\s+/g, "") ||
      ""
  );
  const [bio, setBio] = useState(activeProfile?.bio || "");
  const [website, setWebsite] = useState(activeProfile?.website || "");
  const [avatarUri, setAvatarUri] = useState<string | null>(
    (activeProfile as any)?.avatar?.url ||
      (activeUser ? getUserAvatarUrl(activeUser) || null : null)
  );
  const [avatarMediaId, setAvatarMediaId] = useState<string | null>(
    activeProfile?.avatar_media_id || null
  );
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  useEffect(() => {
    if (activeProfile || activeUser) {
      if (!displayName) {
        setDisplayName(activeProfile?.display_name || activeUser?.name || "");
      }
      if (!username) {
        setUsername(
          activeProfile?.username ||
            activeUser?.name?.toLowerCase().replace(/\s+/g, "") ||
            ""
        );
      }
      if (!bio && activeProfile?.bio) {
        setBio(activeProfile.bio);
      }
      if (!website && activeProfile?.website) {
        setWebsite(activeProfile.website);
      }
      if (!avatarUri) {
        setAvatarUri(
          (activeProfile as any)?.avatar?.url ||
            (activeUser ? getUserAvatarUrl(activeUser) || null : null)
        );
      }
    }
  }, [activeProfile, activeUser]);

  const initials = getUserInitials(
    displayName || activeUser?.name,
    activeUser?.email
  );

  const handlePickAvatar = useCallback(async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Photo library access is needed to change your profile avatar."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAvatarUri(asset.uri);
        setIsUploadingMedia(true);

        try {
          const mediaId = await uploadSingleMedia(
            {
              uri: asset.uri,
              filename: asset.fileName || "avatar.jpg",
              mimeType: asset.mimeType || "image/jpeg",
              fileSize: asset.fileSize,
            },
            getMediaUploadUrl,
            confirmMediaUpload
          );
          setAvatarMediaId(mediaId);
        } catch {
          Alert.alert(
            "Upload Error",
            "Could not upload image. Please try again."
          );
          setAvatarMediaId(null);
        } finally {
          setIsUploadingMedia(false);
        }
      }
    } catch {
      Alert.alert("Error", "Failed to select image.");
      setIsUploadingMedia(false);
    }
  }, [getMediaUploadUrl, confirmMediaUpload]);

  const handleSave = useCallback(async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      Alert.alert("Validation Error", "Username is required.");
      return;
    }

    try {
      const updatedProfile = await updateProfile({
        display_name: displayName.trim() || null,
        username: trimmedUsername,
        bio: bio.trim() || null,
        website: website.trim() || null,
        avatar_media_id: avatarMediaId,
      }).unwrap();

      // Update Redux user profile in authSlice if present
      if (activeUser) {
        dispatch(
          setUser({
            ...activeUser,
            profile: {
              ...(activeUser.profile || {}),
              ...updatedProfile,
            },
          })
        );
      }

      await refetchMe();
      router.back();
    } catch (err: any) {
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        "Could not save profile changes. Please try again.";
      Alert.alert("Save Failed", errorMsg);
    }
  }, [
    username,
    displayName,
    bio,
    website,
    avatarMediaId,
    updateProfile,
    activeUser,
    dispatch,
    refetchMe,
  ]);

  return {
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
    isSaving: isUpdating || isUploadingMedia,
    isUploadingMedia,
    handlePickAvatar,
    handleSave,
    handleCancel: () => router.back(),
  };
}
