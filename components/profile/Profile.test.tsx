import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => "MaterialCommunityIcons");
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
import { EditProfileBanner } from "./edit/EditProfileBanner";
import { ProfileInputField } from "./edit/ProfileInputField";
import { AccountClassificationCardRow } from "./edit/AccountClassificationCardRow";
import { AccountClassificationBottomSheet } from "./edit/AccountClassificationBottomSheet";
import { ClassificationOptionCard } from "./edit/ClassificationOptionCard";
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

    it("renders location and joined date in the first row, and website below", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(<ProfileInfo profile={mockProfile} />);
      });

      const root = renderer!.root;
      const json = JSON.stringify(renderer!.toJSON());

      expect(json).toContain("Kampala");
      expect(json).toContain("Joined January 2026");
      expect(json).toContain("https://example.com");

      const websiteLink = root.findByProps({ accessibilityRole: "link" });
      expect(websiteLink).toBeDefined();
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

  describe("EditProfileBanner", () => {
    it("renders initials fallback and triggers pick callbacks", () => {
      const onPickCover = jest.fn();
      const onPickAvatar = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <EditProfileBanner
            coverUri={null}
            avatarUri={null}
            initials="PO"
            isUploadingCover={false}
            isUploadingAvatar={false}
            onPickCover={onPickCover}
            onRemoveCover={jest.fn()}
            onPickAvatar={onPickAvatar}
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("PO");

      const root = renderer!.root;
      const avatarBtn = root.findByProps({
        accessibilityLabel: "Change avatar photo",
      });
      act(() => {
        avatarBtn.props.onPress();
      });
      expect(onPickAvatar).toHaveBeenCalled();

      const coverBtn = root.findByProps({
        accessibilityLabel: "Change cover photo",
      });
      act(() => {
        coverBtn.props.onPress();
      });
      expect(onPickCover).toHaveBeenCalled();
    });
  });

  describe("AccountClassificationCardRow", () => {
    it("renders personal and organization cards with correct selection", () => {
      const onPressCard = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <AccountClassificationCardRow
            accountType="individual"
            onPressCard={onPressCard}
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Personal Account");
      expect(json).toContain("Church / Ministry");

      const root = renderer!.root;
      const churchCard = root.findByProps({
        accessibilityLabel: "Church or Ministry Account",
      });
      act(() => {
        churchCard.props.onPress();
      });
      expect(onPressCard).toHaveBeenCalledWith("organization");
    });
  });

  describe("AccountClassificationBottomSheet", () => {
    it("renders options and triggers onConfirm", () => {
      const onConfirm = jest.fn();
      const onClose = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <AccountClassificationBottomSheet
            visible={true}
            initialAccountType="individual"
            initialCategory="Believer"
            onClose={onClose}
            onConfirm={onConfirm}
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Account Classification");
      expect(json).toContain("Believer");
      expect(json).toContain("Pastor / Elder");

      const root = renderer!.root;
      const confirmButton = root.findByProps({
        accessibilityLabel: "Confirm Classification",
      });
      expect(confirmButton).toBeDefined();
      act(() => {
        confirmButton.props.onPress();
      });
      expect(onConfirm).toHaveBeenCalledWith("individual", "Believer");
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("ClassificationOptionCard", () => {
    it("renders card title, description, and handles category selection", () => {
      const onSelect = jest.fn();
      const onSelectCategory = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ClassificationOptionCard
            type="individual"
            title="Personal Account"
            description="Individual description"
            iconName="person"
            isSelected={true}
            onSelect={onSelect}
            categories={["Believer", "Pastor / Elder"]}
            selectedCategory="Believer"
            onSelectCategory={onSelectCategory}
            subCategoryLabel="Select role:"
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Personal Account");
      expect(json).toContain("Individual description");
      expect(json).toContain("SELECTED");
      expect(json).toContain("✓ Believer");
      expect(json).toContain("Pastor / Elder");
    });
  });

  describe("ProfileInputField", () => {
    it("renders label, placeholder, and triggers onChangeText", () => {
      const onChangeText = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ProfileInputField
            label="Location"
            value="Kampala"
            onChangeText={onChangeText}
            placeholder="e.g. Kampala, Uganda"
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Location");
      expect(json).toContain("Kampala");

      const root = renderer!.root;
      const textInput = root.findByProps({
        placeholder: "e.g. Kampala, Uganda",
      });
      expect(textInput).toBeDefined();

      act(() => {
        textInput.props.onChangeText("Entebbe");
      });
      expect(onChangeText).toHaveBeenCalledWith("Entebbe");
    });
  });
});

