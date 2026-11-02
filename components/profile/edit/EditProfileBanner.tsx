import React, { useCallback } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { EditProfileBannerProps } from "./types";

export function EditProfileBanner({
  coverUri,
  avatarUri,
  initials,
  isUploadingCover,
  isUploadingAvatar,
  onPickCover,
  onRemoveCover,
  onPickAvatar,
}: EditProfileBannerProps) {
  const theme = useTheme();

  const handlePressCover = useCallback(() => {
    if (isUploadingCover) return;

    if (!coverUri) {
      onPickCover();
      return;
    }

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Upload New Photo", "Remove Cover Photo"],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            onPickCover();
          } else if (buttonIndex === 2) {
            onRemoveCover();
          }
        }
      );
    } else {
      Alert.alert("Cover Photo", "Choose an option", [
        { text: "Cancel", style: "cancel" },
        { text: "Upload New Photo", onPress: onPickCover },
        {
          text: "Remove Cover Photo",
          style: "destructive",
          onPress: onRemoveCover,
        },
      ]);
    }
  }, [coverUri, isUploadingCover, onPickCover, onRemoveCover]);

  return (
    <View style={styles.container}>
      {/* Cover Photo Banner */}
      <View
        style={[
          styles.banner,
          {
            backgroundColor: theme.dark ? "#4A1212" : "#801C1C",
          },
        ]}
      >
        {coverUri ? (
          <Image
            source={{ uri: coverUri }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : null}

        {/* Center Camera Button for Cover */}
        <TouchableOpacity
          onPress={handlePressCover}
          disabled={isUploadingCover}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Change cover photo"
          style={styles.coverCameraButton}
        >
          {isUploadingCover ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="camera" size={22} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Overlapping Avatar */}
      <View style={styles.avatarWrapper}>
        <TouchableOpacity
          onPress={onPickAvatar}
          disabled={isUploadingAvatar}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Change avatar photo"
          style={[
            styles.avatarBorder,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.background,
            },
          ]}
        >
          <View
            style={[
              styles.avatarInner,
              {
                backgroundColor: theme.dark ? "#5A1E1E" : theme.colors.primary,
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

            {isUploadingAvatar && (
              <View style={styles.avatarLoadingOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}
          </View>

          {/* Small Camera Badge */}
          <View
            style={[
              styles.avatarCameraBadge,
              {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.background,
              },
            ]}
          >
            <Ionicons name="camera" size={13} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 8,
  },
  banner: {
    width: "100%",
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  coverCameraButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrapper: {
    marginTop: -42,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  avatarBorder: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCameraBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});

