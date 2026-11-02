import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { pickImageFromLibrary, pickAndUploadMedia } from "./mediaPicker";
import { uploadSingleMedia } from "./mediaUploader";

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock("./mediaUploader", () => ({
  uploadSingleMedia: jest.fn(),
}));

describe("utils/mediaPicker", () => {
  const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("pickImageFromLibrary", () => {
    it("returns null and alerts if permission is denied", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: "denied",
      });

      const result = await pickImageFromLibrary({
        permissionRationale: "Permission custom message",
      });

      expect(result).toBeNull();
      expect(alertSpy).toHaveBeenCalledWith(
        "Permission Denied",
        "Permission custom message"
      );
      expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });

    it("returns null when user cancels picker", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: true,
        assets: null,
      });

      const result = await pickImageFromLibrary({ aspect: [1, 1] });

      expect(result).toBeNull();
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          aspect: [1, 1],
          allowsEditing: true,
          quality: 0.85,
        })
      );
    });

    it("returns assets array on successful image selection", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: "granted",
      });
      const mockAssets = [
        {
          uri: "file:///path/to/img.jpg",
          fileName: "img.jpg",
          mimeType: "image/jpeg",
          fileSize: 1024,
        },
      ];
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: mockAssets,
      });

      const result = await pickImageFromLibrary();

      expect(result).toEqual(mockAssets);
    });
  });

  describe("pickAndUploadMedia", () => {
    it("returns null if image picking returns null", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: "denied",
      });

      const result = await pickAndUploadMedia({
        defaultFilename: "avatar.jpg",
        getMediaUploadUrl: jest.fn() as any,
        confirmMediaUpload: jest.fn() as any,
      });

      expect(result).toBeNull();
      expect(uploadSingleMedia).not.toHaveBeenCalled();
    });

    it("picks, calls onUploadStart, uploads successfully and returns mediaId", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [
          {
            uri: "file:///path/to/avatar.jpg",
            fileName: "avatar.jpg",
            mimeType: "image/jpeg",
            fileSize: 2048,
          },
        ],
      });

      (uploadSingleMedia as jest.Mock).mockResolvedValueOnce("media-12345");

      const onUploadStart = jest.fn();
      const mockGetUploadUrl = jest.fn();
      const mockConfirmUpload = jest.fn();

      const result = await pickAndUploadMedia({
        aspect: [1, 1],
        defaultFilename: "avatar.jpg",
        getMediaUploadUrl: mockGetUploadUrl as any,
        confirmMediaUpload: mockConfirmUpload as any,
        onUploadStart,
      });

      expect(onUploadStart).toHaveBeenCalledWith("file:///path/to/avatar.jpg");
      expect(uploadSingleMedia).toHaveBeenCalledWith(
        {
          uri: "file:///path/to/avatar.jpg",
          filename: "avatar.jpg",
          mimeType: "image/jpeg",
          fileSize: 2048,
        },
        mockGetUploadUrl,
        mockConfirmUpload
      );
      expect(result).toEqual({
        uri: "file:///path/to/avatar.jpg",
        mediaId: "media-12345",
      });
    });

    it("handles upload failure by alerting and returning null", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [
          {
            uri: "file:///path/to/cover.jpg",
            fileName: "cover.jpg",
            mimeType: "image/jpeg",
          },
        ],
      });

      (uploadSingleMedia as jest.Mock).mockRejectedValueOnce(
        new Error("Upload network failure")
      );

      const result = await pickAndUploadMedia({
        aspect: [16, 9],
        defaultFilename: "cover.jpg",
        getMediaUploadUrl: jest.fn() as any,
        confirmMediaUpload: jest.fn() as any,
      });

      expect(result).toBeNull();
      expect(alertSpy).toHaveBeenCalledWith(
        "Upload Error",
        "Could not upload image. Please try again."
      );
    });
  });
});

