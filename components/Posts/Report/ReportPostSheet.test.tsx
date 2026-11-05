import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { ReportPostSheet } from "./ReportPostSheet";
import { POST_REPORT_REASONS } from "./constants";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 20, left: 0, right: 0 }),
}));
jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    useTheme: () => ({
      colors: {
        primary: "#DE3A3A",
        onPrimary: "#FFFFFF",
        surface: "#FFFFFF",
        onSurface: "#111111",
        surfaceVariant: "#202020",
        onSurfaceVariant: "#6F6262",
        outline: "#CCCCCC",
        outlineVariant: "#EFE1E1",
        backdrop: "rgba(0, 0, 0, 0.4)",
        background: "#000000",
        shadow: "#000000",
      },
    }),
  };
});

describe("ReportPostSheet", () => {
  it("renders all 7 report reasons when visible is true", () => {
    const onClose = jest.fn();
    const onSelectReason = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ReportPostSheet
          visible={true}
          authorName="Bob"
          onClose={onClose}
          onSelectReason={onSelectReason}
        />
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: "Report Post" })).toBeDefined();
    expect(
      root.findByProps({ children: "Why are you reporting this post by Bob?" })
    ).toBeDefined();

    // Verify all 7 reasons are rendered with accessibility labels
    POST_REPORT_REASONS.forEach((reasonItem) => {
      const button = root.findByProps({
        accessibilityLabel: `Report as ${reasonItem.label}`,
      });
      expect(button).toBeDefined();
    });
  });

  it("calls onSelectReason with the selected reason code when a reason tile is pressed", () => {
    const onSelectReason = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ReportPostSheet
          visible={true}
          onClose={jest.fn()}
          onSelectReason={onSelectReason}
        />
      );
    });

    const root = renderer!.root;
    const sexualContentButton = root.findByProps({
      accessibilityLabel: "Report as Sexual Content",
    });

    act(() => {
      sexualContentButton.props.onPress();
    });

    expect(onSelectReason).toHaveBeenCalledWith("sexual_content");
  });

  it("calls onClose when the close icon button is pressed", () => {
    const onClose = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ReportPostSheet
          visible={true}
          onClose={onClose}
          onSelectReason={jest.fn()}
        />
      );
    });

    const root = renderer!.root;
    const closeButton = root.findByProps({
      accessibilityLabel: "Close report sheet",
    });

    act(() => {
      closeButton.props.onPress();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the backdrop is pressed", () => {
    const onClose = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ReportPostSheet
          visible={true}
          onClose={onClose}
          onSelectReason={jest.fn()}
        />
      );
    });

    const root = renderer!.root;
    const backdrop = root.findByProps({
      accessibilityLabel: "Dismiss report sheet",
    });

    act(() => {
      backdrop.props.onPress();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
