import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { TouchableOpacity } from "react-native";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    useTheme: () => ({
      colors: {
        background: "#FFFFFF",
        surface: "#FFFFFF",
        onSurface: "#111111",
        surfaceVariant: "#F8F2F2",
        onSurfaceVariant: "#6F6262",
        outlineVariant: "#EFE1E1",
        primary: "#DE3A3A",
        primaryContainer: "#FDE8E8",
        onPrimaryContainer: "#8F1F1F",
      },
    }),
  };
});

import { DiscoverAccountCard } from "./DiscoverAccountCard";
import { DiscoverSearchBar } from "./DiscoverSearchBar";
import { DiscoverFilterBar } from "./DiscoverFilterBar";
import { DiscoverAccount } from "./types";

describe("Discover UI Components", () => {
  const mockAccount: DiscoverAccount = {
    id: "acc-1",
    name: "Grace Mensah",
    username: "gracem",
    initials: "GM",
    avatarColor: "#5CA432",
    meta: "Followed by Sarah M.",
    bio: "Pastor · Teaching on faith, family and everyday life...",
    isFollowing: false,
  };

  describe("DiscoverAccountCard", () => {
    it("renders account details, initials and Follow button", () => {
      const onToggle = jest.fn();
      const tree = ReactTestRenderer.create(
        <DiscoverAccountCard account={mockAccount} onToggleFollow={onToggle} />
      );

      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain("Grace Mensah");
      expect(json).toContain("@gracem · Followed by Sarah M.");
      expect(json).toContain("Pastor · Teaching on faith");
      expect(json).toContain("Follow");
    });

    it("renders Following button when isFollowing is true", () => {
      const onToggle = jest.fn();
      const tree = ReactTestRenderer.create(
        <DiscoverAccountCard
          account={{ ...mockAccount, isFollowing: true }}
          onToggleFollow={onToggle}
        />
      );

      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain("Following");
    });

    it("triggers onToggleFollow when follow button is tapped", () => {
      const onToggle = jest.fn();
      const tree = ReactTestRenderer.create(
        <DiscoverAccountCard account={mockAccount} onToggleFollow={onToggle} />
      );

      const buttons = tree.root.findAllByType(TouchableOpacity);
      // The second TouchableOpacity is the follow button inside the card
      const followBtn = buttons.find(
        (b) => b.props.accessibilityLabel === "Follow Grace Mensah"
      );
      expect(followBtn).toBeDefined();

      act(() => {
        followBtn?.props.onPress();
      });

      expect(onToggle).toHaveBeenCalledWith("acc-1");
    });

    it("triggers onPressProfile when card is pressed", () => {
      const onProfile = jest.fn();
      const tree = ReactTestRenderer.create(
        <DiscoverAccountCard
          account={mockAccount}
          onToggleFollow={jest.fn()}
          onPressProfile={onProfile}
        />
      );

      const card = tree.root.findAllByType(TouchableOpacity).find(
        (b) => b.props.accessibilityLabel === "Account Grace Mensah"
      );
      expect(card).toBeDefined();

      act(() => {
        card?.props.onPress();
      });

      expect(onProfile).toHaveBeenCalledWith("acc-1");
    });
  });

  describe("DiscoverSearchBar", () => {
    it("renders input with placeholder", () => {
      const tree = ReactTestRenderer.create(
        <DiscoverSearchBar value="Church" onChangeText={jest.fn()} />
      );

      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain("Search people, churches, ministries...");
    });

    it("renders clear button and clears search when tapped", () => {
      const onClear = jest.fn();
      const tree = ReactTestRenderer.create(
        <DiscoverSearchBar
          value="Grace"
          onChangeText={jest.fn()}
          onClear={onClear}
        />
      );

      const clearBtn = tree.root.findByProps({
        accessibilityLabel: "Clear search text",
      });
      expect(clearBtn).toBeDefined();

      act(() => {
        clearBtn.props.onPress();
      });

      expect(onClear).toHaveBeenCalledTimes(1);
    });
  });

  describe("DiscoverFilterBar", () => {
    it("renders categories and handles selection", () => {
      const onSelect = jest.fn();
      const tree = ReactTestRenderer.create(
        <DiscoverFilterBar
          categories={["All", "Churches", "Ministries"]}
          selectedCategory="All"
          onSelectCategory={onSelect}
        />
      );

      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain("All");
      expect(json).toContain("Churches");
      expect(json).toContain("Ministries");

      const churchBtn = tree.root.findAllByType(TouchableOpacity).find(
        (b) => b.props.accessibilityLabel === "Churches filter"
      );
      expect(churchBtn).toBeDefined();

      act(() => {
        churchBtn?.props.onPress();
      });

      expect(onSelect).toHaveBeenCalledWith("Churches");
    });
  });
});

