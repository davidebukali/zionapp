import {
  formatSettingsUserProfile,
  resolveNotificationTogglesOnMasterSwitch,
  createDeviceNotificationPreferences,
  updateUserProfileState,
} from "./utils";
import { User, UserProfile } from "../auth/types";
import { IndividualNotificationPreferences } from "./types";

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
});
