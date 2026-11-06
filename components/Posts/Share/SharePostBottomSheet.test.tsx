import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { SharePostBottomSheet } from "./SharePostBottomSheet";
import { Post } from "../../../features/posts/types";
import { OnlineContact } from "../../../features/messages/types";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: "light" },
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 40, bottom: 20, left: 0, right: 0 }),
}));
jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    useTheme: () => ({
      dark: false,
      colors: {
        primary: "#DE3A3A",
        surface: "#FFFFFF",
        surfaceVariant: "#202020",
        onSurface: "#111111",
        onSurfaceVariant: "#6F6262",
        outline: "#E0E0E0",
        outlineVariant: "#EFE1E1",
        background: "#000000",
        backdrop: "rgba(0, 0, 0, 0.5)",
      },
    }),
  };
});

describe("SharePostBottomSheet", () => {
  const mockPost: Post = {
    id: "post-99",
    title: "Mountain Sunset",
    author: "Alice Walker",
    authorId: "user-alice",
    content: "Beautiful golden hour view from the summit.",
    createdAt: "2026-11-06T12:00:00Z",
    updatedAt: "2026-11-06T12:00:00Z",
    imageUrl: "https://example.com/sunset.jpg",
    likes: "24",
    comments: "5",
    liked: false,
    isReposted: false,
    repostsCount: 0,
    bookmarked: false,
  };

  const mockRecipients: OnlineContact[] = [
    {
      id: "user-bob",
      name: "Bob Miller",
      username: "bobm",
      initials: "BM",
      isOnline: true,
      avatarColor: "#DE3A3A",
    },
    {
      id: "user-charlie",
      name: "Charlie Davis",
      username: "charlied",
      initials: "CD",
      isOnline: false,
      avatarColor: "#4CAF50",
    },
  ];

  it("renders with custom Share via Direct Message title and post author subtitle", () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <SharePostBottomSheet
          visible={true}
          post={mockPost}
          recipients={mockRecipients}
          searchQuery=""
          onChangeSearch={jest.fn()}
          onClearSearch={jest.fn()}
          onSelectRecipient={jest.fn()}
          onClose={jest.fn()}
          onLoadMore={jest.fn()}
          isLoadingMore={false}
          hasMore={false}
        />
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: "Share via Direct Message" })).toBeDefined();
    expect(root.findByProps({ children: "Post by Alice Walker" })).toBeDefined();
  });

  it("calls onSelectRecipient when a contact row is tapped", () => {
    const onSelectRecipient = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <SharePostBottomSheet
          visible={true}
          post={mockPost}
          recipients={mockRecipients}
          searchQuery=""
          onChangeSearch={jest.fn()}
          onClearSearch={jest.fn()}
          onSelectRecipient={onSelectRecipient}
          onClose={jest.fn()}
          onLoadMore={jest.fn()}
          isLoadingMore={false}
          hasMore={false}
        />
      );
    });

    const root = renderer!.root;
    const recipientButton = root.findByProps({
      accessibilityLabel: "Message Bob Miller",
    });

    act(() => {
      recipientButton.props.onPress();
    });

    expect(onSelectRecipient).toHaveBeenCalledWith(mockRecipients[0]);
  });

  it("calls onClose when the close button is pressed", () => {
    const onClose = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <SharePostBottomSheet
          visible={true}
          post={mockPost}
          recipients={mockRecipients}
          searchQuery=""
          onChangeSearch={jest.fn()}
          onClearSearch={jest.fn()}
          onSelectRecipient={jest.fn()}
          onClose={onClose}
          onLoadMore={jest.fn()}
          isLoadingMore={false}
          hasMore={false}
        />
      );
    });

    const root = renderer!.root;
    const closeBtn = root.findByProps({
      accessibilityLabel: "Close Share via Direct Message",
    });

    act(() => {
      closeBtn.props.onPress();
    });

    expect(onClose).toHaveBeenCalled();
  });
});

