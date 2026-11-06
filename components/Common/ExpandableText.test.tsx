import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { Text, TouchableOpacity } from "react-native";

jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    useTheme: () => ({
      colors: {
        primary: "#DE3A3A",
        onSurface: "#111111",
      },
    }),
  };
});

import { ExpandableText } from "./ExpandableText";

describe("ExpandableText component", () => {
  it("renders short text without 'Read more' button", () => {
    const component = ReactTestRenderer.create(
      <ExpandableText text="Short single-line text" maxLines={3} />
    );

    const json = JSON.stringify(component.toJSON());
    expect(json).toContain("Short single-line text");
    expect(json).not.toContain("Read more");
  });

  it("detects multiline text exceeding maxLines and displays 'Read more'", () => {
    const multilineText = "Line 1\nLine 2\nLine 3\nLine 4";
    const component = ReactTestRenderer.create(
      <ExpandableText text={multilineText} maxLines={3} />
    );

    const json = JSON.stringify(component.toJSON());
    expect(json).toContain("Read more");
  });

  it("displays 'Read more' when onTextLayout reports lines exceeding maxLines", () => {
    const component = ReactTestRenderer.create(
      <ExpandableText text="A long paragraph that wraps across lines" maxLines={3} />
    );

    expect(JSON.stringify(component.toJSON())).not.toContain("Read more");

    const textElement = component.root.findByType(Text);
    act(() => {
      textElement.props.onTextLayout({
        nativeEvent: {
          lines: [{ text: "line 1" }, { text: "line 2" }, { text: "line 3" }, { text: "line 4" }],
        },
      });
    });

    const updatedJson = JSON.stringify(component.toJSON());
    expect(updatedJson).toContain("Read more");
  });

  it("toggles between 'Read more' and 'Show less' when clicked", () => {
    const onToggleMock = jest.fn();
    const multilineText = "Line 1\nLine 2\nLine 3\nLine 4";

    const component = ReactTestRenderer.create(
      <ExpandableText
        text={multilineText}
        maxLines={3}
        onToggleExpand={onToggleMock}
      />
    );

    const buttons = component.root.findAllByType(TouchableOpacity);
    // Find the button with accessibilityLabel 'Read more'
    const readMoreButton = buttons.find(
      (btn) => btn.props.accessibilityLabel === "Read more"
    );
    expect(readMoreButton).toBeDefined();

    // Click 'Read more'
    act(() => {
      readMoreButton!.props.onPress();
    });

    expect(onToggleMock).toHaveBeenCalledWith(true);
    expect(JSON.stringify(component.toJSON())).toContain("Show less");

    // Click 'Show less'
    const showLessButton = component.root
      .findAllByType(TouchableOpacity)
      .find((btn) => btn.props.accessibilityLabel === "Show less");
    expect(showLessButton).toBeDefined();

    act(() => {
      showLessButton!.props.onPress();
    });

    expect(onToggleMock).toHaveBeenCalledWith(false);
    expect(JSON.stringify(component.toJSON())).toContain("Read more");
  });

  it("fires onPressText when the text touchable is pressed", () => {
    const onPressTextMock = jest.fn();
    const component = ReactTestRenderer.create(
      <ExpandableText
        text="Clickable text"
        onPressText={onPressTextMock}
      />
    );

    const textTouchable = component.root.findByType(TouchableOpacity);
    act(() => {
      textTouchable.props.onPress();
    });

    expect(onPressTextMock).toHaveBeenCalledTimes(1);
  });

  it("does not render action buttons when isTruncationEnabled is false", () => {
    const multilineText = "Line 1\nLine 2\nLine 3\nLine 4";
    const component = ReactTestRenderer.create(
      <ExpandableText
        text={multilineText}
        maxLines={3}
        isTruncationEnabled={false}
      />
    );

    const json = JSON.stringify(component.toJSON());
    expect(json).not.toContain("Read more");
    expect(json).not.toContain("Show less");
  });
});

