import { Alert, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { saveImageToDevice } from "./mediaDownloader";

jest.mock("expo-file-system", () => ({
  cacheDirectory: "file:///mock/cache/",
  documentDirectory: "file:///mock/documents/",
  downloadAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  deleteAsync: jest.fn(),
  copyAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  EncodingType: {
    Base64: "base64",
  },
  StorageAccessFramework: {
    getUriForDirectoryInRoot: jest.fn(),
    requestDirectoryPermissionsAsync: jest.fn(),
    createFileAsync: jest.fn(),
  },
}));

describe("utils/mediaDownloader", () => {
  const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
    (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);
  });

  it("returns error and alerts if image URL is invalid", async () => {
    const result = await saveImageToDevice("");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid image URL");
    expect(alertSpy).toHaveBeenCalledWith("Error", "Invalid image URL provided.");
    expect(FileSystem.downloadAsync).not.toHaveBeenCalled();
  });

  describe("Android StorageAccessFramework flow", () => {
    const originalPlatform = Platform.OS;

    beforeEach(() => {
      Platform.OS = "android";
    });

    afterEach(() => {
      Platform.OS = originalPlatform;
    });

    it("successfully saves image to user selected directory via SAF", async () => {
      (FileSystem.downloadAsync as jest.Mock).mockResolvedValueOnce({
        status: 200,
        uri: "file:///mock/cache/12345_sample.jpg",
      });
      (
        FileSystem.StorageAccessFramework.getUriForDirectoryInRoot as jest.Mock
      ).mockReturnValueOnce("content://com.android.externalstorage.documents/tree/primary%3ADownload");
      (
        FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync as jest.Mock
      ).mockResolvedValueOnce({
        granted: true,
        directoryUri: "content://mock/user/selected/folder",
      });
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce("base64data==");
      (
        FileSystem.StorageAccessFramework.createFileAsync as jest.Mock
      ).mockResolvedValueOnce("content://mock/user/selected/folder/sample.jpg");
      (FileSystem.writeAsStringAsync as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await saveImageToDevice("https://example.com/media/sample.jpg");

      expect(result.success).toBe(true);
      expect(result.uri).toBe("content://mock/user/selected/folder/sample.jpg");
      expect(FileSystem.downloadAsync).toHaveBeenCalled();
      expect(
        FileSystem.StorageAccessFramework.createFileAsync
      ).toHaveBeenCalledWith(
        "content://mock/user/selected/folder",
        "sample",
        "image/jpeg"
      );
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        "content://mock/user/selected/folder/sample.jpg",
        "base64data==",
        { encoding: "base64" }
      );
      expect(alertSpy).toHaveBeenCalledWith(
        "Image Saved",
        "The image was successfully saved to your device."
      );
      expect(FileSystem.deleteAsync).toHaveBeenCalled();
    });

    it("handles user cancelling the SAF directory picker gracefully", async () => {
      (FileSystem.downloadAsync as jest.Mock).mockResolvedValueOnce({
        status: 200,
        uri: "file:///mock/cache/12345_sample.jpg",
      });
      (
        FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync as jest.Mock
      ).mockResolvedValueOnce({
        granted: false,
      });

      const result = await saveImageToDevice("https://example.com/media/sample.jpg");

      expect(result.success).toBe(false);
      expect(result.canceled).toBe(true);
      expect(FileSystem.readAsStringAsync).not.toHaveBeenCalled();
      expect(FileSystem.deleteAsync).toHaveBeenCalled();
      // Should NOT show error alert on deliberate user cancellation
      expect(alertSpy).not.toHaveBeenCalledWith(
        "Save Failed",
        expect.any(String)
      );
    });
  });

  describe("iOS / Fallback documentDirectory flow", () => {
    const originalPlatform = Platform.OS;

    beforeEach(() => {
      Platform.OS = "ios";
    });

    afterEach(() => {
      Platform.OS = originalPlatform;
    });

    it("copies downloaded file to documentDirectory and alerts on iOS", async () => {
      (FileSystem.downloadAsync as jest.Mock).mockResolvedValueOnce({
        status: 200,
        uri: "file:///mock/cache/12345_sample.jpg",
      });
      (FileSystem.copyAsync as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await saveImageToDevice("https://example.com/media/sample.jpg");

      expect(result.success).toBe(true);
      expect(result.uri).toBe("file:///mock/documents/sample.jpg");
      expect(FileSystem.copyAsync).toHaveBeenCalledWith({
        from: "file:///mock/cache/12345_sample.jpg",
        to: "file:///mock/documents/sample.jpg",
      });
      expect(alertSpy).toHaveBeenCalledWith(
        "Image Saved",
        "The image was successfully saved to your device."
      );
      expect(FileSystem.deleteAsync).toHaveBeenCalled();
    });

    it("handles download HTTP errors and alerts user", async () => {
      (FileSystem.downloadAsync as jest.Mock).mockResolvedValueOnce({
        status: 404,
        uri: "file:///mock/cache/12345_sample.jpg",
      });

      const result = await saveImageToDevice("https://example.com/media/sample.jpg");

      expect(result.success).toBe(false);
      expect(result.error).toContain("404");
      expect(alertSpy).toHaveBeenCalledWith(
        "Save Failed",
        expect.stringContaining("404")
      );
      expect(FileSystem.copyAsync).not.toHaveBeenCalled();
    });
  });
});

