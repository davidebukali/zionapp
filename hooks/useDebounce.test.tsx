import React from "react";
import { Text } from "react-native";
import ReactTestRenderer, { act } from "react-test-renderer";
import { useDebounce } from "./useDebounce";

function TestConsumer({ value }: { value: string }) {
  const debounced = useDebounce(value, 300);
  return <Text>{debounced}</Text>;
}

describe("hooks/useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns initial value immediately", () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<TestConsumer value="initial" />);
    });

    const root = renderer!.root;
    expect(root.findByType(Text).props.children).toBe("initial");
  });

  it("updates debounced value only after delay has passed", () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<TestConsumer value="initial" />);
    });

    act(() => {
      renderer.update(<TestConsumer value="updated" />);
    });
    expect(renderer!.root.findByType(Text).props.children).toBe("initial");

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(renderer!.root.findByType(Text).props.children).toBe("initial");

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(renderer!.root.findByType(Text).props.children).toBe("updated");
  });

  it("cancels pending update if value changes quickly", () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<TestConsumer value="v1" />);
    });

    act(() => {
      renderer.update(<TestConsumer value="v2" />);
    });
    act(() => {
      jest.advanceTimersByTime(150);
    });

    act(() => {
      renderer.update(<TestConsumer value="v3" />);
    });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(renderer!.root.findByType(Text).props.children).toBe("v1");

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(renderer!.root.findByType(Text).props.children).toBe("v3");
  });
});

