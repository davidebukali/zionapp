import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    useTheme: () => ({
      dark: false,
      colors: {
        primary: "#DE3A3A",
        surface: "#FFFFFF",
        onSurface: "#111111",
        outlineVariant: "#EFE1E1",
        shadow: "#000000",
      },
    }),
  };
});

import { PostVisibilityDropdown } from "./PostVisibilityDropdown";

describe("PostVisibilityDropdown", () => {
  it("renders active label and icon for public visibility", () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <PostVisibilityDropdown value="public" onChange={jest.fn()} />
      );
    });

    const json = JSON.stringify(renderer!.toJSON());
    expect(json).toContain("Everyone");
    expect(json).toContain("globe-outline");
  });

  it("renders active label and icon for followers visibility", () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <PostVisibilityDropdown value="followers" onChange={jest.fn()} />
      );
    });

    const json = JSON.stringify(renderer!.toJSON());
    expect(json).toContain("Followers");
    expect(json).toContain("people-outline");
  });

  it("handles dropdown selection and fires onChange with new visibility", () => {
    const onChange = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <PostVisibilityDropdown value="public" onChange={onChange} />
      );
    });

    const root = renderer!.root;
    const pillButton = root.findByProps({
      accessibilityLabel: "Audience: Everyone",
    });

    // Tap to open popover
    act(() => {
      pillButton.props.onPress();
    });

    const followersOption = root.findByProps({
      accessibilityLabel: "Followers",
    });
    expect(followersOption).toBeDefined();

    // Select Followers
    act(() => {
      followersOption.props.onPress();
    });

    expect(onChange).toHaveBeenCalledWith("followers");
  });
});

