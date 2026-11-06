import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { TouchableOpacity } from "react-native";

jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    useTheme: () => ({
      colors: {
        primary: "#DE3A3A",
        background: "#000000",
        onBackground: "#FFFFFF",
        onSurfaceVariant: "#6F6262",
        outlineVariant: "#EFE1E1",
      },
    }),
  };
});

import { Tabs } from "./Tabs";

describe("Tabs common component", () => {
  const mockTabs = [
    { key: "accounts", label: "Accounts" },
    { key: "posts", label: "Posts" },
  ];

  it("renders all tabs with their labels", () => {
    const component = ReactTestRenderer.create(
      <Tabs
        tabs={mockTabs}
        activeTab="accounts"
        onSelectTab={jest.fn()}
      />
    );

    const json = JSON.stringify(component.toJSON());
    expect(json).toContain("Accounts");
    expect(json).toContain("Posts");
  });

  it("indicates the active tab correctly", () => {
    const component = ReactTestRenderer.create(
      <Tabs
        tabs={mockTabs}
        activeTab="posts"
        onSelectTab={jest.fn()}
      />
    );

    const buttons = component.root.findAllByType(TouchableOpacity);
    expect(buttons).toHaveLength(2);
    expect(buttons[0].props.accessibilityState).toEqual({ selected: false });
    expect(buttons[1].props.accessibilityState).toEqual({ selected: true });
  });

  it("fires onSelectTab when an inactive tab is pressed", () => {
    const handleSelectTab = jest.fn();
    const component = ReactTestRenderer.create(
      <Tabs
        tabs={mockTabs}
        activeTab="accounts"
        onSelectTab={handleSelectTab}
      />
    );

    const buttons = component.root.findAllByType(TouchableOpacity);
    act(() => {
      buttons[1].props.onPress();
    });

    expect(handleSelectTab).toHaveBeenCalledWith("posts");
  });
});

