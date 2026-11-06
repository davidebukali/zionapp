import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { useDiscover } from "./useDiscover";

jest.mock("./useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

jest.mock("react-redux", () => ({
  useSelector: (selector: any) =>
    selector({
      auth: {
        user: { id: "user-1", name: "Current User" },
      },
    }),
}));

const mockAccounts = [
  { id: "1", name: "Grace Church", username: "gracechurch", meta: "Church", bio: "A community church", isFollowing: false },
  { id: "2", name: "Pastor Mensah", username: "pmensah", meta: "Pastor", bio: "Pastor & Teacher", isFollowing: false },
];

const mockPosts = [
  { id: "p1", title: "Sunday Service", author: "Grace Church", content: "Join us this Sunday" },
  { id: "p2", title: "Daily Devotional", author: "Pastor Mensah", content: "Word of the day" },
];

jest.mock("../features/users/api", () => ({
  useSearchUsersQuery: () => ({
    data: mockAccounts,
    isLoading: false,
    isFetching: false,
    refetch: jest.fn(),
  }),
  useFollowUserMutation: () => [jest.fn()],
  useUnfollowUserMutation: () => [jest.fn()],
}));

jest.mock("../features/posts/api", () => ({
  useSearchPostsQuery: () => ({
    data: {
      posts: mockPosts,
      total: 2,
      lastPage: 1,
      currentPage: 1,
    },
    isLoading: false,
    isFetching: false,
    refetch: jest.fn(),
  }),
}));

jest.mock("./useFeedPostActions", () => ({
  useFeedPostActions: () => ({
    onLike: jest.fn(),
    onComment: jest.fn(),
    onRepost: jest.fn(),
    onBookmark: jest.fn(),
  }),
}));

jest.mock("./useReportPost", () => ({
  useReportPost: () => ({
    reportTarget: null,
    openReport: jest.fn(),
    closeReport: jest.fn(),
    submitReport: jest.fn(),
  }),
}));

jest.mock("./useSharePostViaDM", () => ({
  useSharePostViaDM: () => ({
    isOpen: false,
    shareTarget: null,
    recipients: [],
    searchQuery: "",
    setSearchQuery: jest.fn(),
    handleClearSearch: jest.fn(),
    handleSelectRecipient: jest.fn(),
    closeShareDM: jest.fn(),
    onLoadMore: jest.fn(),
    isLoadingMore: false,
    hasMore: false,
  }),
}));

let hookResult: ReturnType<typeof useDiscover>;

function TestHookConsumer() {
  hookResult = useDiscover();
  return null;
}

describe("hooks/useDiscover", () => {
  it("initializes with default values", () => {
    act(() => {
      ReactTestRenderer.create(<TestHookConsumer />);
    });

    expect(hookResult.activeTab).toBe("accounts");
    expect(hookResult.searchQuery).toBe("");
    expect(hookResult.selectedCategory).toBe("All");
    expect(hookResult.accounts).toHaveLength(2);
    expect(hookResult.posts).toHaveLength(2);
  });

  it("updates activeTab when setActiveTab is called", () => {
    act(() => {
      ReactTestRenderer.create(<TestHookConsumer />);
    });

    act(() => {
      hookResult.setActiveTab("posts");
    });

    expect(hookResult.activeTab).toBe("posts");
  });

  it("filters accounts by category", () => {
    act(() => {
      ReactTestRenderer.create(<TestHookConsumer />);
    });

    act(() => {
      hookResult.setSelectedCategory("Churches");
    });

    expect(hookResult.accounts).toHaveLength(1);
    expect(hookResult.accounts[0].name).toBe("Grace Church");
  });

  it("filters posts by category", () => {
    act(() => {
      ReactTestRenderer.create(<TestHookConsumer />);
    });

    act(() => {
      hookResult.setSelectedCategory("Churches");
    });

    expect(hookResult.posts).toHaveLength(1);
    expect(hookResult.posts[0].author).toBe("Grace Church");
  });
});
