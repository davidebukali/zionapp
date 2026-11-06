import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { MediaCollage } from "./MediaCollage";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    useTheme: () => ({
      colors: {
        surfaceVariant: "#202020",
        onSurface: "#111111",
        primary: "#DE3A3A",
      },
    }),
  };
});

describe("components/Common/MediaCollage", () => {
  it("renders null when items is empty", () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<MediaCollage items={[]} />);
    });
    expect(renderer!.toJSON()).toBeNull();
  });

  it("renders single image tile for 1 item", () => {
    const handlePressItem = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <MediaCollage
          items={["https://example.com/photo1.jpg"]}
          onPressItem={handlePressItem}
        />
      );
    });

    const root = renderer!.root;
    const tile = root.findByProps({ accessibilityLabel: "Media item 1" });
    act(() => {
      tile.props.onPress();
    });
    expect(handlePressItem).toHaveBeenCalledWith(0);
  });

  it("renders 2 image tiles for 2 items", () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <MediaCollage
          items={[
            "https://example.com/photo1.jpg",
            "https://example.com/photo2.jpg",
          ]}
        />
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ accessibilityLabel: "Media item 1" })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: "Media item 2" })).toBeDefined();
  });

  it("renders 3 image tiles for 3 items", () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <MediaCollage
          items={[
            "https://example.com/1.jpg",
            "https://example.com/2.jpg",
            "https://example.com/3.jpg",
          ]}
        />
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ accessibilityLabel: "Media item 1" })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: "Media item 2" })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: "Media item 3" })).toBeDefined();
  });

  it("renders +N overlay count for 4+ items", () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <MediaCollage
          items={[
            "https://example.com/1.jpg",
            "https://example.com/2.jpg",
            "https://example.com/3.jpg",
            "https://example.com/4.jpg",
            "https://example.com/5.jpg",
          ]}
        />
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: "+2" })).toBeDefined();
  });

  it("renders floating action buttons in composer mode and triggers onEdit and onRemoveAll", () => {
    const handleEdit = jest.fn();
    const handleRemoveAll = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <MediaCollage
          items={[{ uri: "https://example.com/photo1.jpg" }]}
          onEdit={handleEdit}
          onRemoveAll={handleRemoveAll}
        />
      );
    });

    const root = renderer!.root;
    const editBtn = root.findByProps({ accessibilityLabel: "Edit attached media" });
    const removeBtn = root.findByProps({
      accessibilityLabel: "Remove all attached media",
    });

    act(() => {
      editBtn.props.onPress();
    });
    expect(handleEdit).toHaveBeenCalledTimes(1);

    act(() => {
      removeBtn.props.onPress();
    });
    expect(handleRemoveAll).toHaveBeenCalledTimes(1);
  });
});

