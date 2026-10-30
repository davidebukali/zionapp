import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 40, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    useTheme: () => ({
      colors: {
        surface: "#FFFFFF",
        onSurface: "#111111",
        outlineVariant: "#EFE1E1",
        primary: "#DE3A3A",
      },
    }),
  };
});

import { AppHeader } from "./AppHeader";

describe("AppHeader component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the title and notification bell button", () => {
    const tree = ReactTestRenderer.create(<AppHeader title="Home" />);
    const json = JSON.stringify(tree.toJSON());

    expect(json).toContain("Home");
    const button = tree.root.findByProps({ accessibilityLabel: "Notifications" });
    expect(button).toBeDefined();
  });

  it("navigates to /notifications by default when bell icon is pressed", () => {
    const tree = ReactTestRenderer.create(<AppHeader title="Home" />);
    const button = tree.root.findByProps({ accessibilityLabel: "Notifications" });

    act(() => {
      button.props.onPress();
    });

    expect(router.push).toHaveBeenCalledWith("/notifications");
  });

  it("calls custom onPressNotifications handler when provided", () => {
    const onCustomPress = jest.fn();
    const tree = ReactTestRenderer.create(
      <AppHeader title="Home" onPressNotifications={onCustomPress} />
    );
    const button = tree.root.findByProps({ accessibilityLabel: "Notifications" });

    act(() => {
      button.props.onPress();
    });

    expect(onCustomPress).toHaveBeenCalledTimes(1);
    expect(router.push).not.toHaveBeenCalled();
  });

  it("hides unread dot when hasUnreadNotifications is false", () => {
    const withUnread = ReactTestRenderer.create(
      <AppHeader title="Home" hasUnreadNotifications={true} />
    );
    const withoutUnread = ReactTestRenderer.create(
      <AppHeader title="Home" hasUnreadNotifications={false} />
    );

    const withJson = JSON.stringify(withUnread.toJSON());
    const withoutJson = JSON.stringify(withoutUnread.toJSON());

    // withUnread has an inner dot View inside the bell TouchableOpacity
    const withButton = withUnread.root.findByProps({ accessibilityLabel: "Notifications" });
    const withoutButton = withoutUnread.root.findByProps({ accessibilityLabel: "Notifications" });

    expect(withButton.props.children[1]).not.toBeNull();
    expect(withoutButton.props.children[1]).toBeNull();
  });
});

