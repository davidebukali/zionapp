import React from "react";
import { KeyboardAvoidingView, Platform, Text } from "react-native";
import ReactTestRenderer, { act } from "react-test-renderer";
import { KeyboardAvoidingContainer } from "./KeyboardAvoidingContainer";
import * as useKeyboardVisibleModule from "../../hooks/useKeyboardVisible";

describe("components/Common/KeyboardAvoidingContainer", () => {
  let useKeyboardVisibleSpy: jest.SpyInstance;

  beforeEach(() => {
    useKeyboardVisibleSpy = jest.spyOn(
      useKeyboardVisibleModule,
      "useKeyboardVisible"
    ).mockReturnValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders with behavior='padding' by default", () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <KeyboardAvoidingContainer>
          <Text>Content</Text>
        </KeyboardAvoidingContainer>
      );
    });

    const avoidingView = renderer!.root.findByType(KeyboardAvoidingView);
    expect(avoidingView.props.behavior).toBe("padding");
  });

  it("enables avoiding view on iOS even when keyboard is not visible", () => {
    Platform.OS = "ios";
    useKeyboardVisibleSpy.mockReturnValue(false);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <KeyboardAvoidingContainer>
          <Text>Content</Text>
        </KeyboardAvoidingContainer>
      );
    });

    const avoidingView = renderer!.root.findByType(KeyboardAvoidingView);
    expect(avoidingView.props.enabled).toBe(true);
  });

  it("disables avoiding view on Android when keyboard is hidden, and enables when keyboard is visible", () => {
    Platform.OS = "android";
    useKeyboardVisibleSpy.mockReturnValue(false);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <KeyboardAvoidingContainer>
          <Text>Content</Text>
        </KeyboardAvoidingContainer>
      );
    });

    let avoidingView = renderer!.root.findByType(KeyboardAvoidingView);
    expect(avoidingView.props.enabled).toBe(false);

    // When keyboard becomes visible
    useKeyboardVisibleSpy.mockReturnValue(true);
    act(() => {
      renderer.update(
        <KeyboardAvoidingContainer>
          <Text>Content</Text>
        </KeyboardAvoidingContainer>
      );
    });

    avoidingView = renderer!.root.findByType(KeyboardAvoidingView);
    expect(avoidingView.props.enabled).toBe(true);
  });

  it("respects explicit enabled prop override", () => {
    Platform.OS = "android";
    useKeyboardVisibleSpy.mockReturnValue(true);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <KeyboardAvoidingContainer enabled={false}>
          <Text>Content</Text>
        </KeyboardAvoidingContainer>
      );
    });

    const avoidingView = renderer!.root.findByType(KeyboardAvoidingView);
    expect(avoidingView.props.enabled).toBe(false);
  });

  it("passes through other KeyboardAvoidingView props such as keyboardVerticalOffset", () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <KeyboardAvoidingContainer keyboardVerticalOffset={64}>
          <Text>Content</Text>
        </KeyboardAvoidingContainer>
      );
    });

    const avoidingView = renderer!.root.findByType(KeyboardAvoidingView);
    expect(avoidingView.props.keyboardVerticalOffset).toBe(64);
  });
});
