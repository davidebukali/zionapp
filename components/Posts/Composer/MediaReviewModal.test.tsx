import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 40, bottom: 20, left: 0, right: 0 }),
}));
jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    useTheme: () => ({
      colors: {
        primary: "#7C3AED",
        background: "#000000",
        onBackground: "#FFFFFF",
      },
    }),
  };
});

import { MediaReviewModal } from "./MediaReviewModal";
import { MediaItem } from "../../../utils/mediaUploader";

describe("MediaReviewModal", () => {
  const sampleItems: MediaItem[] = [
    { uri: "file:///mock/photo1.jpg" },
    { uri: "file:///mock/photo2.jpg" },
  ];

  it("renders review counter and action buttons", () => {
    let testRenderer!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      testRenderer = ReactTestRenderer.create(
        <MediaReviewModal
          visible={true}
          items={sampleItems}
          currentIndex={0}
          onIndexChange={jest.fn()}
          onClose={jest.fn()}
          onDeleteItem={jest.fn()}
        />
      );
    });

    const renderedJson = JSON.stringify(testRenderer.toJSON());
    expect(renderedJson).toContain("1 / 2");
    expect(renderedJson).toContain("Done");
  });

  it("renders crop button when onCropItem is provided", () => {
    const handleCrop = jest.fn();
    let testRenderer!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      testRenderer = ReactTestRenderer.create(
        <MediaReviewModal
          visible={true}
          items={sampleItems}
          currentIndex={1}
          onIndexChange={jest.fn()}
          onClose={jest.fn()}
          onDeleteItem={jest.fn()}
          onCropItem={handleCrop}
        />
      );
    });

    const rootInstance = testRenderer.root;
    const cropButton = rootInstance.findByProps({
      accessibilityLabel: "Crop item",
    });
    expect(cropButton).toBeTruthy();

    act(() => {
      cropButton.props.onPress();
    });
    expect(handleCrop).toHaveBeenCalledWith(1);
  });

  it("calls onDeleteItem when delete button is pressed", () => {
    const handleDelete = jest.fn();
    let testRenderer!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      testRenderer = ReactTestRenderer.create(
        <MediaReviewModal
          visible={true}
          items={sampleItems}
          currentIndex={0}
          onIndexChange={jest.fn()}
          onClose={jest.fn()}
          onDeleteItem={handleDelete}
        />
      );
    });

    const rootInstance = testRenderer.root;
    const deleteButton = rootInstance.findByProps({
      accessibilityLabel: "Delete item",
    });
    expect(deleteButton).toBeTruthy();

    act(() => {
      deleteButton.props.onPress();
    });
    expect(handleDelete).toHaveBeenCalledTimes(1);
  });
});
