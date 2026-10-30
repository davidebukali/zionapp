import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 20, left: 0, right: 0 }),
}));
jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    useTheme: () => ({
      colors: {
        surface: "#FFFFFF",
        primary: "#DE3A3A",
        onSurfaceVariant: "#6F6262",
        outlineVariant: "#EFE1E1",
        onPrimary: "#FFFFFF",
        shadow: "#000000",
      },
    }),
  };
});

import { CustomTabBar } from "./CustomTabBar";

describe("CustomTabBar component", () => {
  const mockNavigation = {
    emit: jest.fn().mockReturnValue({ defaultPrevented: false }),
    dispatch: jest.fn(),
  };

  const mockState = {
    index: 0,
    key: "tab-state",
    routes: [
      { key: "index-tab", name: "index" },
      { key: "discover-tab", name: "discover" },
      { key: "messages-tab", name: "messages" },
      { key: "settings-tab", name: "settings" },
    ],
  };

  it("renders tab buttons without text labels below icons", () => {
    const tree = ReactTestRenderer.create(
      <CustomTabBar
        state={mockState}
        descriptors={{}}
        navigation={mockNavigation}
      />
    );

    const json = JSON.stringify(tree.toJSON());
    // Should NOT contain raw visible Text labels
    expect(json).not.toContain('"type":"Text"');

    // Accessibility labels should still be present on the buttons
    expect(tree.root.findByProps({ accessibilityLabel: "Home" })).toBeDefined();
    expect(tree.root.findByProps({ accessibilityLabel: "Discover" })).toBeDefined();
    expect(tree.root.findByProps({ accessibilityLabel: "Messages" })).toBeDefined();
    expect(tree.root.findByProps({ accessibilityLabel: "Me" })).toBeDefined();
  });

  it("maps messages tab to paper-plane icon", () => {
    const tree = ReactTestRenderer.create(
      <CustomTabBar
        state={mockState}
        descriptors={{}}
        navigation={mockNavigation}
      />
    );

    const messagesButton = tree.root.findByProps({ accessibilityLabel: "Messages" });
    const icon = messagesButton.findByType("Ionicons" as any);
    expect(icon.props.name).toBe("paper-plane-outline");
    expect(icon.props.size).toBe(28);
  });

  it("uses focused icon when messages tab is active", () => {
    const focusedState = {
      ...mockState,
      index: 2, // messages is at index 2
    };

    const tree = ReactTestRenderer.create(
      <CustomTabBar
        state={focusedState}
        descriptors={{}}
        navigation={mockNavigation}
      />
    );

    const messagesButton = tree.root.findByProps({ accessibilityLabel: "Messages" });
    const icon = messagesButton.findByType("Ionicons" as any);
    expect(icon.props.name).toBe("paper-plane");
  });

  it("emits tabPress navigation event on press", () => {
    const tree = ReactTestRenderer.create(
      <CustomTabBar
        state={mockState}
        descriptors={{}}
        navigation={mockNavigation}
      />
    );

    const messagesButton = tree.root.findByProps({ accessibilityLabel: "Messages" });

    act(() => {
      messagesButton.props.onPress();
    });

    expect(mockNavigation.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "tabPress",
        target: "messages-tab",
      })
    );
  });
});
