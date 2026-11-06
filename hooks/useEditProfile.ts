import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { router } from "expo-router";

import type { AppDispatch, RootState } from "../store/store";
import { useGetMeQuery } from "../features/auth/api";
import { setUser } from "../features/auth/authSlice";
import { useUpdateProfileMutation } from "../features/users/api";
import type { AccountClassificationType } from "../features/users/types";
import {
  useConfirmMediaUploadMutation,
  useGetMediaUploadUrlMutation,
} from "../features/posts/api";
import {
  getUserAvatarUrl,
  getUserCoverUrl,
  getUserInitials,
  pickAndUploadMedia,
} from "../utils";

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

  // Form Fields State
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
  const [location, setLocation] = useState(activeProfile?.location || "");
  const [accountType, setAccountType] = useState<AccountClassificationType>(
    activeProfile?.account_type || "personal"
  );
  const [category, setCategory] = useState(
    activeProfile?.category || "Believer"
  );
  const [churchId, setChurchId] = useState<string | null>(
    activeProfile?.church_id || null
  );

  // Avatar & Cover Media State
  const [avatarUri, setAvatarUri] = useState<string | null>(
    getUserAvatarUrl(activeUser) || null
  );
  const [avatarMediaId, setAvatarMediaId] = useState<string | null>(
    activeProfile?.avatar_media_id || null
  );
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const [coverUri, setCoverUri] = useState<string | null>(
    getUserCoverUrl(activeProfile) || null
  );
  const [coverMediaId, setCoverMediaId] = useState<string | null>(
    activeProfile?.cover_media_id || null
  );
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Seed form values once user/profile data is loaded from API
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if ((activeProfile || activeUser) && !isInitializedRef.current) {
      isInitializedRef.current = true;
      setDisplayName(activeProfile?.display_name || activeUser?.name || "");
      setUsername(
        activeProfile?.username ||
          activeUser?.name?.toLowerCase().replace(/\s+/g, "") ||
          ""
      );
      setBio(activeProfile?.bio || "");
      setWebsite(activeProfile?.website || "");
      setLocation(activeProfile?.location || "");
      setAccountType(activeProfile?.account_type || "personal");
      setCategory(activeProfile?.category || "Believer");
      setChurchId(activeProfile?.church_id || null);
      setAvatarUri(getUserAvatarUrl(activeUser) || null);
      setAvatarMediaId(activeProfile?.avatar_media_id || null);
      setCoverUri(getUserCoverUrl(activeProfile) || null);
      setCoverMediaId(activeProfile?.cover_media_id || null);
    }
  }, [activeProfile, activeUser]);

  const initials = getUserInitials(
    displayName || activeUser?.name,
    activeUser?.email
  );

  const handlePickAvatar = useCallback(async () => {
    setIsUploadingMedia(true);
    try {
      const result = await pickAndUploadMedia({
        aspect: [1, 1],
        defaultFilename: "avatar.jpg",
        permissionRationale:
          "Photo library access is needed to change your profile avatar.",
        getMediaUploadUrl,
        confirmMediaUpload,
        onUploadStart: (uri) => setAvatarUri(uri),
      });

      if (result) {
        setAvatarMediaId(result.mediaId);
      }
    } finally {
      setIsUploadingMedia(false);
    }
  }, [getMediaUploadUrl, confirmMediaUpload]);

  const handlePickCover = useCallback(async () => {
    setIsUploadingCover(true);
    try {
      const result = await pickAndUploadMedia({
        aspect: [16, 9],
        defaultFilename: "cover.jpg",
        permissionRationale:
          "Photo library access is needed to change your cover photo.",
        getMediaUploadUrl,
        confirmMediaUpload,
        onUploadStart: (uri) => setCoverUri(uri),
      });

      if (result) {
        setCoverMediaId(result.mediaId);
      }
    } finally {
      setIsUploadingCover(false);
    }
  }, [getMediaUploadUrl, confirmMediaUpload]);

  const handleRemoveCover = useCallback(() => {
    setCoverUri(null);
    setCoverMediaId(null);
  }, []);

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
        location: location.trim() || null,
        account_type: accountType,
        category: category.trim() || null,
        church_id: churchId || null,
        avatar_media_id: avatarMediaId,
        cover_media_id: coverMediaId,
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
    location,
    accountType,
    category,
    churchId,
    avatarMediaId,
    coverMediaId,
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
    location,
    setLocation,
    accountType,
    setAccountType,
    category,
    setCategory,
    churchId,
    setChurchId,
    initialChurch: activeProfile?.church || null,
    avatarUri,
    coverUri,
    initials,
    isSaving: isUpdating || isUploadingMedia || isUploadingCover,
    isUploadingMedia,
    isUploadingCover,
    handlePickAvatar,
    handlePickCover,
    handleRemoveCover,
    handleSave,
    handleCancel: () => router.back(),
  };
}
