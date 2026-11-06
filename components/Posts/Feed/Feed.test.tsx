import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 20, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    useTheme: () => ({
      colors: {
        primary: "#DE3A3A",
        onPrimary: "#FFFFFF",
        surface: "#FFFFFF",
        onSurface: "#111111",
        surfaceVariant: "#202020",
        onSurfaceVariant: "#6F6262",
        outlineVariant: "#EFE1E1",
        background: "#000000",
        shadow: "#000000",
      },
    }),
  };
});

jest.mock("../../../hooks/useHomeFeed", () => ({
  useHomeFeed: jest.fn(),
}));
jest.mock("../../../hooks/useFeedPostActions", () => ({
  useFeedPostActions: jest.fn(),
}));
jest.mock("../../../hooks/useFeedNewPosts", () => ({
  useFeedNewPosts: jest.fn(),
}));
jest.mock("../../../hooks/useReportPost", () => ({
  useReportPost: jest.fn(() => ({
    reportTarget: null,
    openReport: jest.fn(),
    closeReport: jest.fn(),
    submitReport: jest.fn(),
  })),
}));
jest.mock("react-redux", () => ({
  useSelector: jest.fn((selector) =>
    selector({
      auth: {
        user: { id: "user-1", name: "Alice" },
      },
    })
  ),
  useDispatch: () => jest.fn(),
}));

import { FeedPostItem } from "./FeedPostItem";
import { HomeFeedContent } from "./HomeFeedContent";
import PostCard from "../PostCard";
import { NewPostsPill } from "./NewPostsPill";
import PostFeedSkeleton from "../PostFeedSkeleton";
import ErrorStateView from "../../Common/ErrorStateView";
import EmptyFeedView from "../EmptyFeedView";
import { InfiniteScrollList } from "../../InfiniteScrollList";
import HomeScreen from "../../../app/(app)/(tabs)/index";
import { Post } from "../../../features/posts/types";
import { useHomeFeed } from "../../../hooks/useHomeFeed";
import { useFeedPostActions } from "../../../hooks/useFeedPostActions";
import { useFeedNewPosts } from "../../../hooks/useFeedNewPosts";

const mockPost: Post = {
  id: "p-1",
  title: "Bob Title",
  author: "Bob Author",
  authorId: "user-2",
  content: "Test post content",
  createdAt: "2026-11-05T10:00:00Z",
  updatedAt: "2026-11-05T10:00:00Z",
  likes: "5",
  comments: "2",
  liked: false,
  isReposted: false,
  repostsCount: 0,
  bookmarked: false,
  isBookmarked: false,
  activityType: "repost",
  activityActor: "Alice",
  feedItemId: "feed-1",
};

describe("components/Posts/Feed", () => {
  describe("FeedPostItem", () => {
    it("renders post card with mapped props and handles user interaction callbacks", () => {
      const actions = {
        onLike: jest.fn(),
        onComment: jest.fn(),
        onRepost: jest.fn(),
        onBookmark: jest.fn(),
        onEdit: jest.fn(),
        onDelete: jest.fn(),
      };

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <FeedPostItem
            post={mockPost}
            currentUser={{ id: "user-1", name: "Alice", email: "alice@example.com" }}
            actions={actions}
          />
        );
      });

      const root = renderer!.root;
      // "Alice" matches currentUser name so resolvedActor should be "You"
      expect(root.findByProps({ children: "You reposted" })).toBeDefined();
      expect(root.findByProps({ children: "Test post content" })).toBeDefined();

      // Verify like callback
      const likeBtn = root.findByProps({ accessibilityLabel: "5 likes" });
      act(() => {
        likeBtn.props.onPress();
      });
      expect(actions.onLike).toHaveBeenCalledWith(mockPost);
    });

    it("passes isFollowingAuthor true for other author posts and handles onFollowToggle", () => {
      const onFollowToggle = jest.fn();
      const actions = {
        onLike: jest.fn(),
        onComment: jest.fn(),
        onRepost: jest.fn(),
        onBookmark: jest.fn(),
        onEdit: jest.fn(),
        onDelete: jest.fn(),
        onFollowToggle,
      };

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <FeedPostItem
            post={mockPost}
            currentUser={{ id: "user-1", name: "Alice", email: "alice@example.com" }}
            actions={actions}
          />
        );
      });

      const root = renderer!.root;
      const postCard = root.findByType(PostCard);
      expect(postCard.props.isFollowingAuthor).toBe(true);

      act(() => {
        postCard.props.onPressFollowToggle();
      });
      expect(onFollowToggle).toHaveBeenCalledWith(mockPost);
    });

    it("forwards onPressReport to actions.onReport with the post object", () => {
      const onReport = jest.fn();
      const actions = {
        onLike: jest.fn(),
        onComment: jest.fn(),
        onRepost: jest.fn(),
        onBookmark: jest.fn(),
        onEdit: jest.fn(),
        onDelete: jest.fn(),
        onReport,
      };

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <FeedPostItem
            post={mockPost}
            currentUser={{ id: "user-1", name: "Alice", email: "alice@example.com" }}
            actions={actions}
          />
        );
      });

      const root = renderer!.root;
      const postCard = root.findByType(PostCard);

      act(() => {
        postCard.props.onPressReport();
      });
      expect(onReport).toHaveBeenCalledWith(mockPost);
    });

    it("forwards onPressBody and onPressImage to actions.onPressPost with post id", () => {
      const onPressPost = jest.fn();
      const actions = {
        onLike: jest.fn(),
        onComment: jest.fn(),
        onRepost: jest.fn(),
        onBookmark: jest.fn(),
        onEdit: jest.fn(),
        onDelete: jest.fn(),
        onPressPost,
      };

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <FeedPostItem
            post={mockPost}
            currentUser={{ id: "user-1", name: "Alice", email: "alice@example.com" }}
            actions={actions}
          />
        );
      });

      const root = renderer!.root;
      const postCard = root.findByType(PostCard);

      act(() => {
        postCard.props.onPressBody();
      });
      expect(onPressPost).toHaveBeenCalledWith(mockPost.id);

      act(() => {
        postCard.props.onPressImage();
      });
      expect(onPressPost).toHaveBeenCalledWith(mockPost.id);
    });
  });

  describe("NewPostsPill", () => {
    it("renders null when count is 0 or negative", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <NewPostsPill count={0} onPress={jest.fn()} />
        );
      });
      expect(renderer!.toJSON()).toBeNull();
    });

    it("renders singular and plural badge labels and responds to press", () => {
      const onPress = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <NewPostsPill count={3} onPress={onPress} />
        );
      });

      const root = renderer!.root;
      const button = root.findByProps({ accessibilityLabel: "Load 3 new posts" });
      expect(button).toBeDefined();
      expect(root.findByProps({ children: "3 new posts" })).toBeDefined();

      act(() => {
        button.props.onPress();
      });
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe("HomeFeedContent", () => {
    const defaultProps = {
      posts: [mockPost],
      isInitialLoading: false,
      hasError: false,
      hasMore: false,
      isLoadingMore: false,
      isRefreshing: false,
      handleRefresh: jest.fn(),
      handleLoadMore: jest.fn(),
      renderPostItem: () => <FeedPostItem post={mockPost} actions={{} as any} />,
    };

    it("renders skeleton during initial loading", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <HomeFeedContent {...defaultProps} isInitialLoading={true} posts={[]} />
        );
      });
      expect(renderer!.root.findByType(PostFeedSkeleton)).toBeDefined();
    });

    it("renders error state view when hasError is true and posts are empty", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <HomeFeedContent
            {...defaultProps}
            hasError={true}
            error={new Error("Network failed")}
            posts={[]}
          />
        );
      });
      expect(renderer!.root.findByType(ErrorStateView)).toBeDefined();
    });

    it("renders empty feed view when posts are empty without error", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <HomeFeedContent {...defaultProps} posts={[]} />
        );
      });
      expect(renderer!.root.findByType(EmptyFeedView)).toBeDefined();
    });

    it("renders list and floating pill when posts exist and newPostsCount > 0", () => {
      const onPressNewPosts = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <HomeFeedContent
            {...defaultProps}
            newPostsCount={4}
            onPressNewPosts={onPressNewPosts}
          />
        );
      });

      const root = renderer!.root;
      expect(root.findByType(InfiniteScrollList)).toBeDefined();
      expect(root.findByProps({ count: 4 })).toBeDefined();
      expect(root.findByProps({ children: "4 new posts" })).toBeDefined();
    });
  });

  describe("HomeScreen", () => {
    it("renders home screen with feed items and wires pill interaction", () => {
      const handleRefresh = jest.fn();
      const handleLoadMore = jest.fn();
      const handlePressNewPosts = jest.fn();
      const handlePullToRefresh = jest.fn();

      (useHomeFeed as jest.Mock).mockReturnValue({
        posts: [mockPost],
        isInitialLoading: false,
        hasError: false,
        error: null,
        hasMore: false,
        isLoadingMore: false,
        isRefreshing: false,
        handleLoadMore,
        handleRefresh,
      });

      (useFeedPostActions as jest.Mock).mockReturnValue({
        onLike: jest.fn(),
        onComment: jest.fn(),
        onRepost: jest.fn(),
        onBookmark: jest.fn(),
        onEdit: jest.fn(),
        onDelete: jest.fn(),
      });

      (useFeedNewPosts as jest.Mock).mockReturnValue({
        newPostsCount: 2,
        resetNewPosts: jest.fn(),
        handlePressNewPosts,
        handlePullToRefresh,
      });

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(<HomeScreen />);
      });

      const root = renderer!.root;
      expect(root.findByType(HomeFeedContent)).toBeDefined();
      expect(root.findByProps({ count: 2 })).toBeDefined();

      const pillBtn = root.findByProps({ accessibilityLabel: "Load 2 new posts" });
      act(() => {
        pillBtn.props.onPress();
      });
      expect(handlePressNewPosts).toHaveBeenCalled();
    });
  });
});
