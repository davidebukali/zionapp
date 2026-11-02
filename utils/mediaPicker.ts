import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { uploadSingleMedia, MediaUploaderApi } from "./mediaUploader";

export interface PickImageOptions {
  aspect?: [number, number];
  allowsEditing?: boolean;
  quality?: number;
  allowsMultipleSelection?: boolean;
  selectionLimit?: number;
  permissionRationale?: string;
}

export interface PickAndUploadMediaOptions extends PickImageOptions {
  defaultFilename: string;
  getMediaUploadUrl: MediaUploaderApi["getMediaUploadUrl"];
  confirmMediaUpload: MediaUploaderApi["confirmMediaUpload"];
  onUploadStart?: (uri: string) => void;
}

export interface UploadedMediaResult {
  uri: string;
  mediaId: string;
}

/**
 * Requests photo library permissions and launches the image picker.
 * Displays a native Alert if permission is denied.
 * Returns null if canceled or denied, or the array of selected assets.
 */
export async function pickImageFromLibrary(
  options?: PickImageOptions
): Promise<ImagePicker.ImagePickerAsset[] | null> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        options?.permissionRationale ||
          "Photo library access is needed to select an image."
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: options?.allowsEditing ?? true,
      aspect: options?.aspect,
      quality: options?.quality ?? 0.85,
      allowsMultipleSelection: options?.allowsMultipleSelection ?? false,
      selectionLimit: options?.selectionLimit,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return result.assets;
  } catch {
    Alert.alert("Error", "Failed to select image.");
    return null;
  }
}

/**
 * Picks a single image and uploads it via presigned URL using uploadSingleMedia.
 * Calls onUploadStart as soon as the image is picked.
 */
export async function pickAndUploadMedia(
  options: PickAndUploadMediaOptions
): Promise<UploadedMediaResult | null> {
  const assets = await pickImageFromLibrary({
    aspect: options.aspect,
    allowsEditing: options.allowsEditing,
    quality: options.quality,
    permissionRationale: options.permissionRationale,
  });

  if (!assets || assets.length === 0) {
    return null;
  }

  const asset = assets[0];
  options.onUploadStart?.(asset.uri);

  try {
    const mediaId = await uploadSingleMedia(
      {
        uri: asset.uri,
        filename: asset.fileName || options.defaultFilename,
        mimeType: asset.mimeType || "image/jpeg",
        fileSize: asset.fileSize,
      },
      options.getMediaUploadUrl,
      options.confirmMediaUpload
    );

    return {
      uri: asset.uri,
      mediaId,
    };
  } catch {
    Alert.alert("Upload Error", "Could not upload image. Please try again.");
    return null;
  }
}

