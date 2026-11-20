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
  { id: "user-1", name: "Current User", username: "currentuser", meta: "Member", bio: "My bio", isFollowing: false },
];

const mockPosts = [
  { id: "p1", title: "Sunday Service", author: "Grace Church", content: "Join us this Sunday" },
  { id: "p2", title: "Daily Devotional", author: "Pastor Mensah", content: "Word of the day" },
];

const mockFollowUserUnwrap = jest.fn().mockResolvedValue({});
const mockFollowUser = jest.fn(() => ({ unwrap: mockFollowUserUnwrap }));
const mockUnfollowUserUnwrap = jest.fn().mockResolvedValue({});
const mockUnfollowUser = jest.fn(() => ({ unwrap: mockUnfollowUserUnwrap }));

jest.mock("../features/users/api", () => ({
  useSearchUsersQuery: () => ({
    data: mockAccounts,
    isLoading: false,
    isFetching: false,
    refetch: jest.fn(),
  }),
  useFollowUserMutation: () => [mockFollowUser],
  useUnfollowUserMutation: () => [mockUnfollowUser],
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

  it("throttles rapid consecutive follow taps on the same account", async () => {
    mockFollowUser.mockClear();

    act(() => {
      ReactTestRenderer.create(<TestHookConsumer />);
    });

    const account = mockAccounts[0];

    // First tap executes
    await act(async () => {
      await hookResult.handleToggleFollow(account);
    });
    expect(mockFollowUser).toHaveBeenCalledTimes(1);

    // Rapid second tap on the same account within 600ms is suppressed
    await act(async () => {
      await hookResult.handleToggleFollow(account);
    });
    expect(mockFollowUser).toHaveBeenCalledTimes(1);

    // Tapping another account is not blocked
    const otherAccount = mockAccounts[1];
    await act(async () => {
      await hookResult.handleToggleFollow(otherAccount);
    });
    expect(mockFollowUser).toHaveBeenCalledTimes(2);
  });

  it("defensively filters out the current user's own account from accounts list", () => {
    act(() => {
      ReactTestRenderer.create(<TestHookConsumer />);
    });

    const accountIds = hookResult.accounts.map((acc) => acc.id);
    expect(accountIds).toContain("1");
    expect(accountIds).toContain("2");
    expect(accountIds).not.toContain("user-1");
  });

  it("prevents following one's own account", async () => {
    mockFollowUser.mockClear();

    act(() => {
      ReactTestRenderer.create(<TestHookConsumer />);
    });

    const selfAccount = mockAccounts[2];
    await act(async () => {
      await hookResult.handleToggleFollow(selfAccount);
    });

    expect(mockFollowUser).not.toHaveBeenCalled();
  });
});
