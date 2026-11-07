import { Alert, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { getFilename, getMimeType } from "./mediaUploader";

export interface SaveImageResult {
  success: boolean;
  canceled?: boolean;
  uri?: string;
  error?: string;
}

export interface SaveImageOptions {
  silent?: boolean;
  customFilename?: string;
}

/**
 * Downloads an image from a remote URL and saves it to device storage using expo-file-system.
 * On Android, utilizes StorageAccessFramework to allow the user to save to Downloads or their chosen directory.
 * On iOS and other platforms, saves to the application document directory.
 */
export async function saveImageToDevice(
  imageUrl: string,
  options: SaveImageOptions = {}
): Promise<SaveImageResult> {
  const { silent = false, customFilename } = options;

  if (!imageUrl || typeof imageUrl !== "string") {
    if (!silent) {
      Alert.alert("Error", "Invalid image URL provided.");
    }
    return { success: false, error: "Invalid image URL" };
  }

  const rawFilename = customFilename || getFilename(imageUrl);
  const mimeType = getMimeType(imageUrl);
  const cacheDirectory = FileSystem.cacheDirectory || "";
  const temporaryCacheUri = `${cacheDirectory}${Date.now()}_${rawFilename}`;

  try {
    // 1. Download image to local app cache
    const downloadResult = await FileSystem.downloadAsync(
      imageUrl,
      temporaryCacheUri
    );

    if (downloadResult.status !== 200) {
      throw new Error(`Download failed with HTTP status ${downloadResult.status}`);
    }

    let savedUri = downloadResult.uri;

    // 2. Android: Use StorageAccessFramework to save to user's storage
    if (Platform.OS === "android" && FileSystem.StorageAccessFramework) {
      let initialDirectoryUri: string | undefined;
      try {
        initialDirectoryUri =
          FileSystem.StorageAccessFramework.getUriForDirectoryInRoot("Download");
      } catch {
        // Fall back to root if Download directory resolution is not supported
      }

      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
          initialDirectoryUri
        );

      if (!permissions.granted) {
        // User deliberately canceled the folder picker
        await cleanUpFile(temporaryCacheUri);
        return { success: false, canceled: true };
      }

      const base64Data = await FileSystem.readAsStringAsync(
        downloadResult.uri,
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );

      // SAF createFileAsync requires the filename WITHOUT the extension
      const filenameWithoutExtension =
        rawFilename.lastIndexOf(".") > 0
          ? rawFilename.substring(0, rawFilename.lastIndexOf("."))
          : rawFilename;

      const createdFileUri =
        await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          filenameWithoutExtension,
          mimeType
        );

      await FileSystem.writeAsStringAsync(createdFileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      savedUri = createdFileUri;
    } else {
      // 3. iOS and other platforms: Save into documentDirectory
      const documentDirectory = FileSystem.documentDirectory || "";
      const destinationUri = `${documentDirectory}${rawFilename}`;

      await FileSystem.copyAsync({
        from: downloadResult.uri,
        to: destinationUri,
      });

      savedUri = destinationUri;
    }

    // 4. Clean up temporary cache file
    await cleanUpFile(temporaryCacheUri);

    if (!silent) {
      Alert.alert(
        "Image Saved",
        "The image was successfully saved to your device."
      );
    }

    return { success: true, uri: savedUri };
  } catch (error: any) {
    await cleanUpFile(temporaryCacheUri);
    const errorMessage = error?.message || "Failed to save image to device.";

    if (!silent) {
      Alert.alert("Save Failed", errorMessage);
    }

    return { success: false, error: errorMessage };
  }
}

async function cleanUpFile(fileUri: string): Promise<void> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
  } catch {
    // Ignore cleanup errors
  }
}

