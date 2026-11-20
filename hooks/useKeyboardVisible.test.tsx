import React from "react";
import { Keyboard, Platform, Text } from "react-native";
import ReactTestRenderer, { act } from "react-test-renderer";
import { useKeyboardVisible } from "./useKeyboardVisible";

function TestConsumer() {
  const isKeyboardVisible = useKeyboardVisible();
  return <Text testID="keyboard-status">{isKeyboardVisible ? "visible" : "hidden"}</Text>;
}

describe("hooks/useKeyboardVisible", () => {
  let listeners: Record<string, () => void> = {};
  const mockRemove = jest.fn();

  beforeEach(() => {
    listeners = {};
    mockRemove.mockClear();
    jest.spyOn(Keyboard, "addListener").mockImplementation((event: string, callback: any) => {
      listeners[event] = callback;
      return { remove: mockRemove } as any;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns false initially when keyboard is hidden", () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<TestConsumer />);
    });

    const statusNode = renderer!.root.findByProps({ testID: "keyboard-status" });
    expect(statusNode.props.children).toBe("hidden");
  });

  it("subscribes to keyboardDidShow/keyboardDidHide on Android and updates state", () => {
    Platform.OS = "android";
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<TestConsumer />);
    });

    expect(Keyboard.addListener).toHaveBeenCalledWith("keyboardDidShow", expect.any(Function));
    expect(Keyboard.addListener).toHaveBeenCalledWith("keyboardDidHide", expect.any(Function));

    // Simulate keyboard show
    act(() => {
      listeners["keyboardDidShow"]?.();
    });
    let statusNode = renderer!.root.findByProps({ testID: "keyboard-status" });
    expect(statusNode.props.children).toBe("visible");

    // Simulate keyboard hide
    act(() => {
      listeners["keyboardDidHide"]?.();
    });
    statusNode = renderer!.root.findByProps({ testID: "keyboard-status" });
    expect(statusNode.props.children).toBe("hidden");
  });

  it("subscribes to keyboardWillShow/keyboardWillHide on iOS and updates state", () => {
    Platform.OS = "ios";
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<TestConsumer />);
    });

    expect(Keyboard.addListener).toHaveBeenCalledWith("keyboardWillShow", expect.any(Function));
    expect(Keyboard.addListener).toHaveBeenCalledWith("keyboardWillHide", expect.any(Function));

    // Simulate keyboard show
    act(() => {
      listeners["keyboardWillShow"]?.();
    });
    let statusNode = renderer!.root.findByProps({ testID: "keyboard-status" });
    expect(statusNode.props.children).toBe("visible");

    // Simulate keyboard hide
    act(() => {
      listeners["keyboardWillHide"]?.();
    });
    statusNode = renderer!.root.findByProps({ testID: "keyboard-status" });
    expect(statusNode.props.children).toBe("hidden");
  });

  it("cleans up subscriptions on unmount", () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<TestConsumer />);
    });

    act(() => {
      renderer.unmount();
    });

    expect(mockRemove).toHaveBeenCalledTimes(2);
  });
});
