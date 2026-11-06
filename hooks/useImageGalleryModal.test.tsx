import React from "react";
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";
import ReactTestRenderer, { act } from "react-test-renderer";
import {
  useImageGalleryModal,
  UseImageGalleryModalOptions,
  UseImageGalleryModalResult,
} from "./useImageGalleryModal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function TestGalleryConsumer({
  options,
  onHookResult,
}: {
  options: UseImageGalleryModalOptions;
  onHookResult: (res: UseImageGalleryModalResult) => void;
}) {
  const result = useImageGalleryModal(options);
  onHookResult(result);
  return <View />;
}

describe("hooks/useImageGalleryModal", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("resolves single imageUrl when images array is empty or not provided", () => {
    let hookResult: UseImageGalleryModalResult | undefined;
    act(() => {
      ReactTestRenderer.create(
        <TestGalleryConsumer
          options={{ imageUrl: "https://example.com/one.jpg" }}
          onHookResult={(res) => {
            hookResult = res;
          }}
        />
      );
    });

    expect(hookResult?.resolvedImages).toEqual(["https://example.com/one.jpg"]);
    expect(hookResult?.isVisible).toBe(true);
    expect(hookResult?.activeIndex).toBe(0);
  });

  it("resolves images array when provided", () => {
    let hookResult: UseImageGalleryModalResult | undefined;
    const images = ["https://example.com/1.jpg", "https://example.com/2.jpg"];

    act(() => {
      ReactTestRenderer.create(
        <TestGalleryConsumer
          options={{ images, initialIndex: 1 }}
          onHookResult={(res) => {
            hookResult = res;
          }}
        />
      );
    });

    expect(hookResult?.resolvedImages).toEqual(images);
    expect(hookResult?.isVisible).toBe(true);
    expect(hookResult?.activeIndex).toBe(1);
  });

  it("updates activeIndex when handleMomentumScrollEnd fires", () => {
    let hookResult: UseImageGalleryModalResult | undefined;
    const images = [
      "https://example.com/1.jpg",
      "https://example.com/2.jpg",
      "https://example.com/3.jpg",
    ];

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <TestGalleryConsumer
          options={{ images }}
          onHookResult={(res) => {
            hookResult = res;
          }}
        />
      );
    });

    expect(hookResult?.activeIndex).toBe(0);

    // Simulate scrolling to page 2 (index 2)
    const scrollEvent = {
      nativeEvent: {
        contentOffset: { x: SCREEN_WIDTH * 2, y: 0 },
      },
    } as NativeSyntheticEvent<NativeScrollEvent>;

    act(() => {
      hookResult?.handleMomentumScrollEnd(scrollEvent);
    });

    expect(hookResult?.activeIndex).toBe(2);
  });

  it("calculates correct getItemLayout offsets", () => {
    let hookResult: UseImageGalleryModalResult | undefined;

    act(() => {
      ReactTestRenderer.create(
        <TestGalleryConsumer
          options={{ images: ["https://example.com/1.jpg"] }}
          onHookResult={(res) => {
            hookResult = res;
          }}
        />
      );
    });

    const layout = hookResult?.getItemLayout(null, 3);
    expect(layout).toEqual({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * 3,
      index: 3,
    });
  });
});

