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
        onPrimary: "#FFFFFF",
        primaryContainer: "#4A1717",
      },
    }),
  };
});

import { ProfileHeader } from "./ProfileHeader";
import { ProfileInfo } from "./ProfileInfo";
import { ProfileTabs } from "./ProfileTabs";
import { UserProfileData } from "../../features/users/types";

const mockProfile: UserProfileData = {
  id: "prof-1",
  userId: "user-1",
  displayName: "Peter Okwi",
  username: "peterokwi",
  bio: "Bio goes here: a line or two about who they are.",
  location: "Kampala",
  website: "https://example.com",
  joinedAt: "2026-01-01T00:00:00Z",
  avatarUrl: null,
  coverUrl: null,
  isFollowing: false,
  followersCount: 342,
  followingCount: 128,
};

describe("components/profile", () => {
  describe("ProfileHeader", () => {
    it("renders Edit Profile button on own profile", () => {
      const onEdit = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ProfileHeader
            profile={mockProfile}
            isOwnProfile={true}
            onPressBack={jest.fn()}
            onPressEditProfile={onEdit}
          />
        );
      });

      const root = renderer!.root;
      const editButton = root.findByProps({ accessibilityLabel: "Edit Profile" });
      expect(editButton).toBeDefined();

      // Trigger edit profile
      act(() => {
        editButton.props.onPress();
      });
      expect(onEdit).toHaveBeenCalled();
    });

    it("renders Message and Follow buttons when viewing another user's profile", () => {
      const onFollow = jest.fn();
      const onMessage = jest.fn();

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ProfileHeader
            profile={mockProfile}
            isOwnProfile={false}
            isFollowing={false}
            onPressBack={jest.fn()}
            onPressMessage={onMessage}
            onPressToggleFollow={onFollow}
          />
        );
      });

      const root = renderer!.root;
      const followButton = root.findByProps({ accessibilityLabel: "Follow" });
      const messageButton = root.findByProps({ accessibilityLabel: "Message" });

      expect(followButton).toBeDefined();
      expect(messageButton).toBeDefined();

      act(() => {
        followButton.props.onPress();
      });
      expect(onFollow).toHaveBeenCalled();

      act(() => {
        messageButton.props.onPress();
      });
      expect(onMessage).toHaveBeenCalled();
    });

    it("renders Following label when already following", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ProfileHeader
            profile={mockProfile}
            isOwnProfile={false}
            isFollowing={true}
            onPressBack={jest.fn()}
            onPressToggleFollow={jest.fn()}
          />
        );
      });

      const root = renderer!.root;
      const followingButton = root.findByProps({ accessibilityLabel: "Following" });
      expect(followingButton).toBeDefined();
    });
  });

  describe("ProfileInfo", () => {
    it("renders user information and only Following / Followers counts (no posts count)", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(<ProfileInfo profile={mockProfile} />);
      });

      const root = renderer!.root;
      const json = JSON.stringify(renderer!.toJSON());

      expect(json).toContain("Peter Okwi");
      expect(json).toContain("@peterokwi");
      expect(json).toContain("128");
      expect(json).toContain("Following");
      expect(json).toContain("342");
      expect(json).toContain("Followers");
      // Must not render posts count
      expect(json).not.toContain("Posts");
    });
  });

  describe("ProfileTabs", () => {
    it("renders tabs and triggers onSelectTab", () => {
      const onSelect = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ProfileTabs activeTab="posts" onSelectTab={onSelect} />
        );
      });

      const root = renderer!.root;
      const likesTab = root.findByProps({ accessibilityLabel: "Likes tab" });
      expect(likesTab).toBeDefined();

      act(() => {
        likesTab.props.onPress();
      });
      expect(onSelect).toHaveBeenCalledWith("likes");
    });
  });
});

