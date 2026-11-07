import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { ImagePreviewModal } from "./ImagePreviewModal";
import * as mediaDownloader from "../../../utils/mediaDownloader";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 20, bottom: 20, left: 0, right: 0 }),
}));

jest.mock("../../../utils/mediaDownloader", () => ({
  saveImageToDevice: jest.fn(),
}));

describe("components/Common/ImagePreviewModal", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("returns null when visible is false", () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ImagePreviewModal
          images={["https://example.com/photo.jpg"]}
          visible={false}
          onClose={jest.fn()}
        />
      );
    });

    expect(renderer!.toJSON()).toBeNull();
  });

  it("renders modal when visible is true with single image", () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ImagePreviewModal
          images={["https://example.com/photo.jpg"]}
          visible={true}
          onClose={jest.fn()}
        />
      );
      jest.runAllTimers();
    });

    const json = JSON.stringify(renderer!.toJSON());
    expect(json).toContain("https://example.com/photo.jpg");
  });

  it("triggers onClose when close button is pressed", () => {
    const handleClose = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ImagePreviewModal
          images={["https://example.com/photo.jpg"]}
          visible={true}
          onClose={handleClose}
        />
      );
      jest.runAllTimers();
    });

    const closeBtn = renderer!.root.findByProps({
      accessibilityLabel: "Close image preview",
    });
    act(() => {
      closeBtn.props.onPress();
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("triggers saveImageToDevice by default when download button is pressed", async () => {
    (mediaDownloader.saveImageToDevice as jest.Mock).mockResolvedValueOnce({
      success: true,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ImagePreviewModal
          images={["https://example.com/photo.jpg"]}
          visible={true}
          onClose={jest.fn()}
          enableDownload={true}
        />
      );
      jest.runAllTimers();
    });

    const downloadBtn = renderer!.root.findByProps({
      accessibilityLabel: "Download image",
    });

    await act(async () => {
      await downloadBtn.props.onPress();
    });

    expect(mediaDownloader.saveImageToDevice).toHaveBeenCalledWith(
      "https://example.com/photo.jpg"
    );
  });

  it("calls custom onDownload when provided", async () => {
    const handleDownload = jest.fn().mockResolvedValue(undefined);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ImagePreviewModal
          images={["https://example.com/photo.jpg"]}
          visible={true}
          onClose={jest.fn()}
          enableDownload={true}
          onDownload={handleDownload}
        />
      );
      jest.runAllTimers();
    });

    const downloadBtn = renderer!.root.findByProps({
      accessibilityLabel: "Download image",
    });

    await act(async () => {
      await downloadBtn.props.onPress();
    });

    expect(handleDownload).toHaveBeenCalledWith("https://example.com/photo.jpg");
    expect(mediaDownloader.saveImageToDevice).not.toHaveBeenCalled();
  });
});
