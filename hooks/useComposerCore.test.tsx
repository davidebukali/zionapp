import React from "react";
import { View } from "react-native";
import ReactTestRenderer, { act } from "react-test-renderer";

jest.mock("react-redux", () => ({
  useSelector: jest.fn((selector) =>
    selector({
      auth: {
        user: {
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
        },
      },
    })
  ),
}));

jest.mock("../utils/mediaPicker", () => ({
  pickImageFromLibrary: jest.fn(),
}));

import { useComposerCore } from "./useComposerCore";
import { pickImageFromLibrary } from "../utils/mediaPicker";
import { MediaItem } from "../utils/mediaUploader";

type ComposerCoreResult = ReturnType<typeof useComposerCore>;

function TestComposerConsumer({
  onHookResult,
}: {
  onHookResult: (result: ComposerCoreResult) => void;
}) {
  const result = useComposerCore();
  onHookResult(result);
  return <View />;
}

describe("hooks/useComposerCore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with default media and crop states", () => {
    let hookResult!: ComposerCoreResult;
    act(() => {
      ReactTestRenderer.create(
        <TestComposerConsumer
          onHookResult={(result) => {
            hookResult = result;
          }}
        />
      );
    });

    expect(hookResult.mediaItems).toEqual([]);
    expect(hookResult.isReviewModalVisible).toBe(false);
    expect(hookResult.reviewIndex).toBe(0);
    expect(hookResult.isCropModalVisible).toBe(false);
    expect(hookResult.cropTargetIndex).toBeNull();
  });

  it("picks media using centralized pickImageFromLibrary utility", async () => {
    const mockAssets = [
      {
        uri: "file:///mock/selected1.jpg",
        fileName: "selected1.jpg",
        mimeType: "image/jpeg",
        fileSize: 2048,
      },
    ];
    (pickImageFromLibrary as jest.Mock).mockResolvedValueOnce(mockAssets);

    let hookResult!: ComposerCoreResult;
    act(() => {
      ReactTestRenderer.create(
        <TestComposerConsumer
          onHookResult={(result) => {
            hookResult = result;
          }}
        />
      );
    });

    await act(async () => {
      await hookResult.pickMedia();
    });

    expect(pickImageFromLibrary).toHaveBeenCalledWith(
      expect.objectContaining({
        allowsEditing: false,
        allowsMultipleSelection: true,
        selectionLimit: 10,
      })
    );
    expect(hookResult.mediaItems).toEqual([
      {
        uri: "file:///mock/selected1.jpg",
        filename: "selected1.jpg",
        mimeType: "image/jpeg",
        fileSize: 2048,
      },
    ]);
  });

  it("updates a specific media item using updateMediaItem", () => {
    let hookResult!: ComposerCoreResult;
    act(() => {
      ReactTestRenderer.create(
        <TestComposerConsumer
          onHookResult={(result) => {
            hookResult = result;
          }}
        />
      );
    });

    const initialItems: MediaItem[] = [
      { uri: "file:///mock/original_1.jpg" },
      { uri: "file:///mock/original_2.jpg" },
    ];

    act(() => {
      hookResult.setMediaItems(initialItems);
    });

    act(() => {
      hookResult.updateMediaItem(1, { uri: "file:///mock/cropped_2.jpg" });
    });

    expect(hookResult.mediaItems[0].uri).toBe("file:///mock/original_1.jpg");
    expect(hookResult.mediaItems[1].uri).toBe("file:///mock/cropped_2.jpg");
  });

  it("manages cropper state via openCropper, closeCropper, and handleApplyCrop", () => {
    let hookResult!: ComposerCoreResult;
    act(() => {
      ReactTestRenderer.create(
        <TestComposerConsumer
          onHookResult={(result) => {
            hookResult = result;
          }}
        />
      );
    });

    act(() => {
      hookResult.setMediaItems([{ uri: "file:///mock/photo.jpg" }]);
    });

    act(() => {
      hookResult.openCropper(0);
    });
    expect(hookResult.isCropModalVisible).toBe(true);
    expect(hookResult.cropTargetIndex).toBe(0);

    act(() => {
      hookResult.handleApplyCrop({
        uri: "file:///mock/photo_cropped.jpg",
        width: 600,
        height: 600,
      });
    });

    expect(hookResult.isCropModalVisible).toBe(false);
    expect(hookResult.cropTargetIndex).toBeNull();
    expect(hookResult.mediaItems[0].uri).toBe(
      "file:///mock/photo_cropped.jpg"
    );
  });
});
