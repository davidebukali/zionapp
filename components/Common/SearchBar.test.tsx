import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { TextInput, TouchableOpacity } from "react-native";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    useTheme: () => ({
      colors: {
        surfaceVariant: "#F8F2F2",
        onSurfaceVariant: "#6F6262",
        onSurface: "#111111",
      },
    }),
  };
});

import { SearchBar } from "./SearchBar";

describe("SearchBar common component", () => {
  it("renders search input with placeholder", () => {
    const component = ReactTestRenderer.create(
      <SearchBar value="" placeholder="Search accounts" onChangeText={jest.fn()} />
    );

    const input = component.root.findByType(TextInput);
    expect(input.props.placeholder).toBe("Search accounts");
  });

  it("does not render clear button when input value is empty", () => {
    const component = ReactTestRenderer.create(
      <SearchBar value="" onChangeText={jest.fn()} />
    );

    const buttons = component.root.findAllByType(TouchableOpacity);
    expect(buttons).toHaveLength(0);
  });

  it("renders clear button when value is present and triggers clear", () => {
    const handleClear = jest.fn();
    const component = ReactTestRenderer.create(
      <SearchBar
        value="Searching something"
        onChangeText={jest.fn()}
        onClear={handleClear}
      />
    );

    const clearButton = component.root.findByProps({
      accessibilityLabel: "Clear search text",
    });
    expect(clearButton).toBeDefined();

    act(() => {
      clearButton.props.onPress();
    });

    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it("defaults to clearing text via onChangeText when onClear is not supplied", () => {
    const handleChangeText = jest.fn();
    const component = ReactTestRenderer.create(
      <SearchBar value="Searching" onChangeText={handleChangeText} />
    );

    const clearButton = component.root.findByProps({
      accessibilityLabel: "Clear search text",
    });

    act(() => {
      clearButton.props.onPress();
    });

    expect(handleChangeText).toHaveBeenCalledWith("");
  });
});

