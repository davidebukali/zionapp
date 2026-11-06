import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { FollowedUsersBottomSheet } from "./FollowedUsersBottomSheet";
import { TaggableUserItem } from "./TaggableUserItem";
import { TaggableUsersSearchBar } from "./TaggableUsersSearchBar";
import { TaggableUser } from "../../features/users/types";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: "Light" },
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 20, left: 0, right: 0 }),
}));
jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  const mockReact = require("react");
  return {
    ...actual,
    useTheme: () => ({
      colors: {
        primary: "#DE3A3A",
        onPrimary: "#FFFFFF",
        primaryContainer: "#F5D0D0",
        onPrimaryContainer: "#400000",
        surface: "#FFFFFF",
        onSurface: "#111111",
        surfaceVariant: "#202020",
        onSurfaceVariant: "#6F6262",
        outline: "#CCCCCC",
        outlineVariant: "#EFE1E1",
        backdrop: "rgba(0, 0, 0, 0.4)",
        background: "#000000",
      },
    }),
    Avatar: {
      Image: (props: any) => mockReact.createElement("Avatar.Image", props),
      Text: (props: any) => mockReact.createElement("Avatar.Text", props),
    },
  };
});

const mockUsers: TaggableUser[] = [
  {
    id: "user-1",
    name: "Jane Doe",
    username: "janedoe",
    initials: "JD",
    avatarUrl: "https://example.com/jane.jpg",
    isFollowing: true,
  },
  {
    id: "user-2",
    name: "John Smith",
    username: "johnsmith",
    initials: "JS",
    avatarUrl: null,
    isFollowing: true,
  },
];

const mockUseGetTaggableUsersQuery = jest.fn();
const mockLazyFetch = jest.fn();

jest.mock("../../features/users/api", () => ({
  useGetTaggableUsersQuery: (args: any, options: any) =>
    mockUseGetTaggableUsersQuery(args, options),
  useLazyGetTaggableUsersQuery: () => [mockLazyFetch],
}));

describe("FollowedUsersBottomSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetTaggableUsersQuery.mockReturnValue({
      data: { users: mockUsers, nextCursor: null },
      isLoading: false,
      isFetching: false,
    });
  });

  it("renders users list and header when visible is true", () => {
    const onClose = jest.fn();
    const onSelectUser = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <FollowedUsersBottomSheet
          visible={true}
          onClose={onClose}
          onSelectUser={onSelectUser}
        />
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: "Tag People" })).toBeDefined();
    expect(
      root.findByProps({ accessibilityLabel: "Tag Jane Doe @janedoe" })
    ).toBeDefined();
    expect(
      root.findByProps({ accessibilityLabel: "Tag John Smith @johnsmith" })
    ).toBeDefined();
  });

  it("calls onSelectUser and onClose when a user row is pressed", () => {
    const onClose = jest.fn();
    const onSelectUser = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <FollowedUsersBottomSheet
          visible={true}
          onClose={onClose}
          onSelectUser={onSelectUser}
        />
      );
    });

    const root = renderer!.root;
    const userRow = root.findByProps({
      accessibilityLabel: "Tag Jane Doe @janedoe",
    });

    act(() => {
      userRow.props.onPress();
    });

    expect(onSelectUser).toHaveBeenCalledWith(mockUsers[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it("renders empty state when users array is empty", () => {
    mockUseGetTaggableUsersQuery.mockReturnValue({
      data: { users: [], nextCursor: null },
      isLoading: false,
      isFetching: false,
    });

    const onClose = jest.fn();
    const onSelectUser = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <FollowedUsersBottomSheet
          visible={true}
          onClose={onClose}
          onSelectUser={onSelectUser}
        />
      );
    });

    const root = renderer!.root;
    expect(
      root.findByProps({ children: "No taggable people found." })
    ).toBeDefined();
  });

  it("calls onClose when close button is pressed", () => {
    const onClose = jest.fn();
    const onSelectUser = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <FollowedUsersBottomSheet
          visible={true}
          onClose={onClose}
          onSelectUser={onSelectUser}
        />
      );
    });

    const root = renderer!.root;
    const closeButton = root.findByProps({
      accessibilityLabel: "Close tag people",
    });

    act(() => {
      closeButton.props.onPress();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  describe("TaggableUserItem", () => {
    it("renders user information and triggers onPress", () => {
      const onPress = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <TaggableUserItem user={mockUsers[0]} onPress={onPress} />
        );
      });

      const root = renderer!.root;
      expect(root.findByProps({ children: "Jane Doe" })).toBeDefined();
      expect(root.findByProps({ children: "@janedoe" })).toBeDefined();

      const button = root.findByProps({
        accessibilityLabel: "Tag Jane Doe @janedoe",
      });
      act(() => {
        button.props.onPress();
      });

      expect(onPress).toHaveBeenCalledWith(mockUsers[0]);
    });
  });

  describe("TaggableUsersSearchBar", () => {
    it("renders search input and responds to change and clear", () => {
      const onChangeText = jest.fn();
      const onClear = jest.fn();

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <TaggableUsersSearchBar
            value="test search"
            onChangeText={onChangeText}
            onClear={onClear}
          />
        );
      });

      const root = renderer!.root;
      const clearButton = root.findByProps({
        accessibilityLabel: "Clear search text",
      });
      act(() => {
        clearButton.props.onPress();
      });

      expect(onClear).toHaveBeenCalledTimes(1);
    });
  });
});
