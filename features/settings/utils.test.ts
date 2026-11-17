import { Alert, Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";
import {
  formatSettingsUserProfile,
  resolveNotificationTogglesOnMasterSwitch,
  createDeviceNotificationPreferences,
  updateUserProfileState,
  openSupportEmailComposer,
  openWebBrowserUrl,
  openFeedbackForm,
  SUPPORT_EMAIL_ADDRESS,
  TERMS_OF_SERVICE_URL,
  PRIVACY_POLICY_URL,
} from "./utils";
import { User, UserProfile } from "../auth/types";
import { IndividualNotificationPreferences } from "./types";

jest.mock("expo-web-browser", () => ({
  openBrowserAsync: jest.fn(),
}));

describe("features/settings/utils", () => {
  describe("formatSettingsUserProfile", () => {
    it("returns null when currentUser is null or undefined", () => {
      expect(formatSettingsUserProfile(null)).toBeNull();
      expect(formatSettingsUserProfile(undefined)).toBeNull();
    });

    it("formats user details with profile username and avatar", () => {
      const mockUser: User = {
        id: "user-123",
        name: "David K.",
        email: "david@example.com",
      };
      const mockProfile: UserProfile = {
        username: "david_dev",
      };

      const result = formatSettingsUserProfile(mockUser, mockProfile);
      expect(result).toEqual({
        name: "David K.",
        username: "david_dev",
        email: "david@example.com",
        avatarUrl: undefined,
      });
    });

    it("falls back to email prefix when username is missing", () => {
      const mockUser: User = {
        id: "user-456",
        name: "Sarah C.",
        email: "sarah.connor@example.com",
      };

      const result = formatSettingsUserProfile(mockUser, null);
      expect(result).toEqual({
        name: "Sarah C.",
        username: "sarah.connor",
        email: "sarah.connor@example.com",
        avatarUrl: undefined,
      });
    });
  });

  describe("resolveNotificationTogglesOnMasterSwitch", () => {
    const savedPreferences: IndividualNotificationPreferences = {
      likes: true,
      comments: false,
      mentions: true,
      reposts: false,
      followers: true,
    };

    it("turns off all individual toggles when master is disabled", () => {
      const result = resolveNotificationTogglesOnMasterSwitch(
        false,
        savedPreferences
      );

      expect(result).toEqual({
        likes: false,
        comments: false,
        mentions: false,
        reposts: false,
        followers: false,
      });
    });

    it("restores previously saved individual toggles when master is enabled", () => {
      const result = resolveNotificationTogglesOnMasterSwitch(
        true,
        savedPreferences
      );

      expect(result).toEqual(savedPreferences);
    });
  });

  describe("createDeviceNotificationPreferences", () => {
    it("creates a complete DeviceNotificationPreferences object", () => {
      const categoryPreferences: IndividualNotificationPreferences = {
        likes: true,
        comments: true,
        mentions: false,
        reposts: true,
        followers: false,
      };

      const result = createDeviceNotificationPreferences(
        true,
        categoryPreferences
      );

      expect(result).toEqual({
        pushNotifications: true,
        likes: true,
        comments: true,
        mentions: false,
        reposts: true,
        followers: false,
      });
    });
  });

  describe("updateUserProfileState", () => {
    it("immutably merges updated profile fields into user state", () => {
      const currentUser: User = {
        id: "user-1",
        name: "Alice",
        email: "alice@example.com",
        profile: {
          username: "alice_w",
          is_private: false,
        },
      };

      const updatedUser = updateUserProfileState(
        currentUser,
        currentUser.profile,
        { is_private: true }
      );

      expect(updatedUser).not.toBe(currentUser);
      expect(updatedUser.profile?.is_private).toBe(true);
      expect(updatedUser.profile?.username).toBe("alice_w");
      expect(currentUser.profile?.is_private).toBe(false);
    });
  });

  describe("openSupportEmailComposer", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(Alert, "alert").mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("opens email app directly with the support mailto URL", async () => {
      jest.spyOn(Linking, "openURL").mockResolvedValueOnce(undefined as any);

      await openSupportEmailComposer();

      expect(Linking.openURL).toHaveBeenCalledWith(
        `mailto:${SUPPORT_EMAIL_ADDRESS}`
      );
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it("opens email app with custom recipient email address when provided", async () => {
      const customRecipientEmail = "dev@example.com";
      jest.spyOn(Linking, "openURL").mockResolvedValueOnce(undefined as any);

      await openSupportEmailComposer(customRecipientEmail);

      expect(Linking.openURL).toHaveBeenCalledWith(
        `mailto:${customRecipientEmail}`
      );
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it("displays an alert when openURL rejects because no email app is available", async () => {
      jest
        .spyOn(Linking, "openURL")
        .mockRejectedValueOnce(new Error("No activity found to handle intent"));

      await openSupportEmailComposer();

      expect(Alert.alert).toHaveBeenCalledWith(
        "Unable to Open Email",
        expect.stringContaining(SUPPORT_EMAIL_ADDRESS)
      );
    });
  });

  describe("openWebBrowserUrl", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(Alert, "alert").mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("opens in-app browser with the provided URL", async () => {
      (WebBrowser.openBrowserAsync as jest.Mock).mockResolvedValueOnce({
        type: "dismiss",
      });

      await openWebBrowserUrl(TERMS_OF_SERVICE_URL);

      expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
        TERMS_OF_SERVICE_URL
      );
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it("falls back to Linking.openURL when WebBrowser throws", async () => {
      (WebBrowser.openBrowserAsync as jest.Mock).mockRejectedValueOnce(
        new Error("WebBrowser unavailable")
      );
      jest.spyOn(Linking, "canOpenURL").mockResolvedValueOnce(true);
      jest.spyOn(Linking, "openURL").mockResolvedValueOnce(undefined as any);

      await openWebBrowserUrl(PRIVACY_POLICY_URL);

      expect(Linking.canOpenURL).toHaveBeenCalledWith(PRIVACY_POLICY_URL);
      expect(Linking.openURL).toHaveBeenCalledWith(PRIVACY_POLICY_URL);
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it("displays alert when both WebBrowser and Linking fail", async () => {
      (WebBrowser.openBrowserAsync as jest.Mock).mockRejectedValueOnce(
        new Error("WebBrowser unavailable")
      );
      jest.spyOn(Linking, "canOpenURL").mockResolvedValueOnce(false);

      await openWebBrowserUrl(TERMS_OF_SERVICE_URL);

      expect(Alert.alert).toHaveBeenCalledWith(
        "Unable to Open Link",
        expect.stringContaining(TERMS_OF_SERVICE_URL)
      );
    });
  });

  describe("openFeedbackForm", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(Alert, "alert").mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("constructs prefilled feedback URL and opens in-app browser", async () => {
      (WebBrowser.openBrowserAsync as jest.Mock).mockResolvedValueOnce({
        type: "dismiss",
      });

      const mockUser: User = {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        profile: { username: "tester123" },
      };

      await openFeedbackForm(mockUser);

      expect(WebBrowser.openBrowserAsync).toHaveBeenCalledTimes(1);
      const calledUrl = (WebBrowser.openBrowserAsync as jest.Mock).mock.calls[0][0];
      expect(calledUrl).toContain("usp=pp_url");
      expect(calledUrl).toContain("entry.1086525665=tester123");
    });
  });
});

