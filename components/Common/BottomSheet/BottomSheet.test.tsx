import React from "react";
import { Text } from "react-native";
import ReactTestRenderer, { act } from "react-test-renderer";

import { BottomSheet } from "./BottomSheet";
import { BottomSheetActionRow } from "./BottomSheetActionRow";
import { ReportReasonList } from "./ReportReasonList";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 20, left: 0, right: 0 }),
}));

jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    useTheme: () => ({
      ...actual.MD3LightTheme,
      colors: {
        ...actual.MD3LightTheme.colors,
        backdrop: "rgba(0, 0, 0, 0.4)",
        surface: "#FFFFFF",
        outline: "#CCCCCC",
        outlineVariant: "#E5E5E5",
        onSurface: "#111111",
        onSurfaceVariant: "#666666",
        error: "#EF4444",
      },
    }),
  };
});

describe("Common BottomSheet Components", () => {
  describe("BottomSheet", () => {
    it("renders title, subtitle and children when visible", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <BottomSheet
            visible={true}
            onClose={jest.fn()}
            title="Test Sheet Title"
            subtitle="Test subtitle prompt"
          >
            <Text testID="sheet-child">Content</Text>
          </BottomSheet>
        );
      });

      const root = renderer!.root;
      expect(root.findByProps({ children: "Test Sheet Title" })).toBeDefined();
      expect(
        root.findByProps({ children: "Test subtitle prompt" })
      ).toBeDefined();
      expect(root.findByProps({ testID: "sheet-child" })).toBeDefined();
    });

    it("triggers onClose when clicking backdrop or close button", () => {
      const onCloseMock = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <BottomSheet
            visible={true}
            onClose={onCloseMock}
            title="Test Title"
            closeAccessibilityLabel="Close test sheet"
          >
            <Text>Body</Text>
          </BottomSheet>
        );
      });

      const root = renderer!.root;
      const backdrop = root.findByProps({
        accessibilityLabel: "Dismiss sheet",
      });
      act(() => {
        backdrop.props.onPress();
      });
      expect(onCloseMock).toHaveBeenCalledTimes(1);

      const closeButton = root.findByProps({
        accessibilityLabel: "Close test sheet",
      });
      act(() => {
        closeButton.props.onPress();
      });
      expect(onCloseMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("BottomSheetActionRow", () => {
    it("fires onPress when tapped", () => {
      const onPressMock = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <BottomSheetActionRow
            label="Delete Message"
            icon="trash-outline"
            destructive
            onPress={onPressMock}
          />
        );
      });

      const button = renderer!.root.findByProps({
        accessibilityLabel: "Delete Message",
      });
      act(() => {
        button.props.onPress();
      });
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("ReportReasonList", () => {
    it("renders options and triggers onSelectReason with the selected value", () => {
      const onSelectReasonMock = jest.fn();
      const reasons = [
        { label: "Spam or Scam", value: "spam" },
        { label: "Harassment", value: "harassment" },
      ];

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ReportReasonList
            reasons={reasons}
            onSelectReason={onSelectReasonMock}
          />
        );
      });

      const root = renderer!.root;
      const spamOption = root.findByProps({
        accessibilityLabel: "Report as Spam or Scam",
      });
      act(() => {
        spamOption.props.onPress();
      });

      expect(onSelectReasonMock).toHaveBeenCalledWith("spam");
    });
  });
});
