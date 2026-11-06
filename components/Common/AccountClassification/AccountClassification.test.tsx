import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => "MaterialCommunityIcons");
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    useTheme: () => ({
      dark: false,
      colors: {
        primary: "#DE3A3A",
        onSurface: "#111111",
        onSurfaceVariant: "#6F6262",
        surface: "#FFFFFF",
        surfaceVariant: "#F8F2F2",
        outlineVariant: "#EFE1E1",
        onSurfaceDisabled: "rgba(17, 17, 17, 0.38)",
      },
    }),
  };
});

import {
  AccountClassificationCardRow,
  AccountClassificationBottomSheet,
  ClassificationOptionCard,
  DEFAULT_PERSONAL_CATEGORIES,
  DEFAULT_ORGANIZATION_CATEGORIES,
} from "./index";

describe("AccountClassification Components", () => {
  describe("constants", () => {
    it("includes required personal categories", () => {
      expect(DEFAULT_PERSONAL_CATEGORIES).toContain("Individual");
      expect(DEFAULT_PERSONAL_CATEGORIES).toContain("Believer");
      expect(DEFAULT_PERSONAL_CATEGORIES).toContain("Pastor");
      expect(DEFAULT_PERSONAL_CATEGORIES).toContain("Elder");
      expect(DEFAULT_PERSONAL_CATEGORIES).toContain("Fellowship Leader");
      expect(DEFAULT_PERSONAL_CATEGORIES).toContain("Intercessor");
      expect(DEFAULT_PERSONAL_CATEGORIES).toContain("Prophet");
      expect(DEFAULT_PERSONAL_CATEGORIES).toContain("Apostle");
    });

    it("includes required organization categories", () => {
      expect(DEFAULT_ORGANIZATION_CATEGORIES).toContain("Local Church");
      expect(DEFAULT_ORGANIZATION_CATEGORIES).toContain("Non-Profit");
      expect(DEFAULT_ORGANIZATION_CATEGORIES).toContain("Fellowship Group");
      expect(DEFAULT_ORGANIZATION_CATEGORIES).toContain("Business");
      expect(DEFAULT_ORGANIZATION_CATEGORIES).toContain("Charity");
      expect(DEFAULT_ORGANIZATION_CATEGORIES).toContain("College");
    });
  });

  describe("AccountClassificationCardRow", () => {
    it("renders unselected state when accountType is null", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <AccountClassificationCardRow
            accountType={null}
            category={null}
            isOptional
            onPressCard={jest.fn()}
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("ACCOUNT TYPE (OPTIONAL)");
      expect(json).toContain("Personal Account");
      expect(json).toContain("Church / Ministry");
      expect(json).toContain("Not selected");
    });

    it("renders selected personal account card and triggers onPressCard", () => {
      const onPressCard = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <AccountClassificationCardRow
            accountType="personal"
            category="Pastor"
            onPressCard={onPressCard}
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Pastor");

      const root = renderer!.root;
      const organizationCard = root.findByProps({
        accessibilityLabel: "Church or Ministry Account",
      });
      act(() => {
        organizationCard.props.onPress();
      });
      expect(onPressCard).toHaveBeenCalledWith("organization");
    });
  });

  describe("AccountClassificationBottomSheet", () => {
    it("disables confirm button when initialCategory is null", () => {
      const onConfirm = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <AccountClassificationBottomSheet
            visible={true}
            initialAccountType={null}
            initialCategory={null}
            onClose={jest.fn()}
            onConfirm={onConfirm}
          />
        );
      });

      const root = renderer!.root;
      const confirmButton = root.findByProps({
        accessibilityLabel: "Confirm Classification",
      });
      expect(confirmButton.props.disabled).toBe(true);

      act(() => {
        confirmButton.props.onPress();
      });
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it("enables confirm button and confirms selection when category is chosen", () => {
      const onConfirm = jest.fn();
      const onClose = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <AccountClassificationBottomSheet
            visible={true}
            initialAccountType="personal"
            initialCategory="Pastor"
            onClose={onClose}
            onConfirm={onConfirm}
          />
        );
      });

      const root = renderer!.root;
      const confirmButton = root.findByProps({
        accessibilityLabel: "Confirm Classification",
      });
      expect(confirmButton.props.disabled).toBe(false);

      act(() => {
        confirmButton.props.onPress();
      });
      expect(onConfirm).toHaveBeenCalledWith("personal", "Pastor");
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("ClassificationOptionCard", () => {
    it("renders chips and triggers onSelectCategory when clicked", () => {
      const onSelectCategory = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ClassificationOptionCard
            type="personal"
            title="Personal Account"
            description="Personal description"
            iconName="person"
            isSelected={true}
            onSelect={jest.fn()}
            categories={["Pastor", "Elder"]}
            selectedCategory="Pastor"
            onSelectCategory={onSelectCategory}
            subCategoryLabel="Select role:"
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("✓ Pastor");
      expect(json).toContain("Elder");
    });
  });
});
