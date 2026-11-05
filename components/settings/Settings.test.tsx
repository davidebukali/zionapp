import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("expo-application", () => ({
  applicationName: "Zion",
  nativeApplicationVersion: "2.4.1",
  nativeBuildVersion: "2840",
}));
jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn().mockResolvedValue(true),
}));
jest.mock("expo-constants", () => ({
  expoConfig: {
    name: "Zion",
    version: "2.4.1",
    ios: { buildNumber: "2840" },
  },
}));
jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    useTheme: () => ({
      dark: true,
      colors: {
        background: "#111111",
        onBackground: "#FFFFFF",
        surface: "#1A1A1A",
        onSurface: "#FFFFFF",
        surfaceVariant: "#202020",
        onSurfaceVariant: "#999999",
        outlineVariant: "#333333",
        outline: "#555555",
        primary: "#DE3A3A",
        primaryContainer: "#4A1717",
        error: "#FFB4AB",
      },
    }),
  };
});

import * as Clipboard from "expo-clipboard";
import {
  SettingsFooter,
  SettingsNavItem,
  SettingsSection,
  SettingsToggleItem,
  SettingsUserCard,
} from "./index";

describe("Settings components", () => {
  describe("SettingsUserCard", () => {
    it("renders user name, handle, and initials fallback", () => {
      const onPressManage = jest.fn();
      const tree = ReactTestRenderer.create(
        <SettingsUserCard
          user={{
            name: "Alex Rivers",
            username: "alexrivers",
            email: "alex@zion.app",
          }}
          onPressManage={onPressManage}
        />
      );

      const root = tree.root;
      expect(root.findByProps({ children: "Alex Rivers" })).toBeTruthy();
      expect(
        root.findByProps({ children: "@alexrivers · alex@zion.app" })
      ).toBeTruthy();

      const manageBtn = root.findByProps({ accessibilityLabel: "Manage profile" });
      act(() => {
        manageBtn.props.onPress();
      });
      expect(onPressManage).toHaveBeenCalledTimes(1);
    });

    it("renders image avatar when avatarUrl is provided", () => {
      const tree = ReactTestRenderer.create(
        <SettingsUserCard
          user={{
            name: "Jane Doe",
            avatarUrl: "https://example.com/avatar.png",
          }}
        />
      );

      const avatarImgs = tree.root.findAll(
        (node) => node.props.source?.uri === "https://example.com/avatar.png"
      );
      expect(avatarImgs.length).toBeGreaterThan(0);
    });
  });

  describe("SettingsSection", () => {
    it("renders section title uppercase and wraps children", () => {
      const tree = ReactTestRenderer.create(
        <SettingsSection title="account">
          <SettingsNavItem icon="person-outline" title="Edit profile" />
        </SettingsSection>
      );

      const root = tree.root;
      expect(root.findByProps({ children: "ACCOUNT" })).toBeTruthy();
      expect(root.findByProps({ children: "Edit profile" })).toBeTruthy();
    });
  });

  describe("SettingsNavItem", () => {
    it("renders title, subtitle, and triggers onPress", () => {
      const onPress = jest.fn();
      const tree = ReactTestRenderer.create(
        <SettingsNavItem
          icon="shield-outline"
          title="Security"
          subtitle="Password & 2FA"
          onPress={onPress}
          showDivider
        />
      );

      const root = tree.root;
      expect(root.findByProps({ children: "Security" })).toBeTruthy();
      expect(root.findByProps({ children: "Password & 2FA" })).toBeTruthy();

      const button = root.findByProps({ accessibilityLabel: "Security" });
      act(() => {
        button.props.onPress();
      });
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("applies destructive styling when isDestructive is true", () => {
      const tree = ReactTestRenderer.create(
        <SettingsNavItem
          icon="log-out-outline"
          title="Log out"
          isDestructive
        />
      );

      const root = tree.root;
      const title = root.findByProps({ children: "Log out" });
      expect(title.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: "#DE3A3A" }),
        ])
      );
    });
  });

  describe("SettingsToggleItem", () => {
    it("renders toggle switch with correct value and responds to change", () => {
      const onValueChange = jest.fn();
      const tree = ReactTestRenderer.create(
        <SettingsToggleItem
          icon="notifications-outline"
          title="Push notifications"
          subtitle="All alerts"
          value={true}
          onValueChange={onValueChange}
        />
      );

      const root = tree.root;
      const toggle = root.findByProps({ accessibilityRole: "switch" });
      expect(toggle.props.value).toBe(true);

      act(() => {
        toggle.props.onValueChange(false);
      });
      expect(onValueChange).toHaveBeenCalledWith(false);
    });

    it("renders Appearance toggle with active subtitle and triggers change", () => {
      const onValueChange = jest.fn();
      const tree = ReactTestRenderer.create(
        <SettingsToggleItem
          icon="bulb-outline"
          title="Appearance"
          subtitle="Dark"
          value={true}
          onValueChange={onValueChange}
        />
      );

      const root = tree.root;
      expect(root.findByProps({ children: "Appearance" })).toBeTruthy();
      expect(root.findByProps({ children: "Dark" })).toBeTruthy();

      const toggle = root.findByProps({ accessibilityRole: "switch" });
      expect(toggle.props.value).toBe(true);

      act(() => {
        toggle.props.onValueChange(false);
      });
      expect(onValueChange).toHaveBeenCalledWith(false);
    });
  });

  describe("SettingsFooter", () => {
    it("formats version and build info, and copies on tap", async () => {
      const onCopySuccess = jest.fn();
      const tree = ReactTestRenderer.create(
        <SettingsFooter onCopySuccess={onCopySuccess} />
      );

      const root = tree.root;
      const expectedText = "Zion · v2.4.1 (build 2840)";
      expect(root.findByProps({ children: expectedText })).toBeTruthy();

      const touchable = root.findByProps({
        accessibilityLabel: `App version: ${expectedText}. Tap to copy.`,
      });

      await act(async () => {
        await touchable.props.onPress();
      });

      expect(Clipboard.setStringAsync).toHaveBeenCalledWith(expectedText);
      expect(onCopySuccess).toHaveBeenCalledWith(expectedText);
    });
  });
});
