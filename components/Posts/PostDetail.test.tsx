import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { Modal, TouchableOpacity, Image } from "react-native";

const mockBack = jest.fn();
const mockPush = jest.fn();
let mockSearchParams: { postId: string; commentId?: string } = { postId: "post-123" };

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
  useLocalSearchParams: () => mockSearchParams,
}));

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 20, left: 0, right: 0 }),
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
        error: "#FF0000",
      },
    }),
  };
});

jest.mock("react-redux", () => ({
  useSelector: jest.fn((selector) =>
    selector({
      auth: {
        user: { id: "user-1", name: "Alice" },
      },
    })
  ),
  useDispatch: () => jest.fn(),
  useStore: () => ({
    getState: () => ({
      auth: { user: { id: "user-1", name: "Alice" } },
    }),
    subscribe: () => () => {},
    dispatch: jest.fn(),
  }),
}));

const mockPostCommentsState = {
  post: {
    id: "post-123",
    title: "Post Title",
    author: "Bob Author",
    authorId: "user-2",
    content: "Detailed post body here",
    createdAt: "2026-11-06T10:00:00Z",
    updatedAt: "2026-11-06T10:00:00Z",
    imageUrl: "https://example.com/image.jpg",
    likes: "10",
    comments: "3",
    liked: false,
    isReposted: false,
    repostsCount: 0,
    bookmarked: false,
    media: undefined as Array<{ id: string; url: string }> | undefined,
  },
  comments: [
    {
      id: "comment-1",
      postId: "post-123",
      author: "Charlie",
      username: "charlie",
      body: "First comment",
      likes: 2,
      liked: false,
      replies: 0,
      createdAt: "2026-11-06T10:05:00Z",
    },
    {
      id: "comment-2",
      postId: "post-123",
      author: "Dave",
      username: "dave",
      body: "Target highlighted comment",
      likes: 0,
      liked: false,
      replies: 0,
      createdAt: "2026-11-06T10:10:00Z",
    },
  ],
  currentUser: { initials: "AL", avatarUrl: undefined },
  draft: "",
  replyingTo: null,
  hasMore: false,
  isInitialLoading: false,
  isLoadingMore: false,
  isRefreshing: false,
  isSubmitting: false,
  error: null,
  refresh: jest.fn(),
  loadMore: jest.fn(),
  selectReply: jest.fn(),
  cancelReply: jest.fn(),
  submitComment: jest.fn(),
  likeComment: jest.fn(),
  handleDraftChange: jest.fn(),
  handleSelectionChange: jest.fn(),
  isMentionSheetVisible: false,
  setIsMentionSheetVisible: jest.fn(),
  handleSelectMention: jest.fn(),
};

jest.mock("../../hooks/usePostComments", () => ({
  usePostComments: () => mockPostCommentsState,
}));

jest.mock("../../hooks/useFollowedUsersSheet", () => ({
  useFollowedUsersSheet: () => ({
    searchQuery: "",
    setSearchQuery: jest.fn(),
    users: [],
    isLoading: false,
    isSearching: false,
    hasMore: false,
    loadMore: jest.fn(),
    selectUser: jest.fn(),
  }),
}));

jest.mock("../../hooks/useCommentReplies", () => ({
  useCommentReplies: () => ({
    replies: [],
    isExpanded: false,
    isLoading: false,
    isLoadingMore: false,
    hasMore: false,
    toggleExpand: jest.fn(),
    loadMoreReplies: jest.fn(),
    likeReply: jest.fn(),
  }),
}));

jest.mock("../../hooks/useFeedPostActions", () => ({
  useFeedPostActions: () => ({
    onLike: jest.fn(),
    onComment: jest.fn(),
    onRepost: jest.fn(),
    onBookmark: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onPressPost: jest.fn(),
  }),
}));

jest.mock("../../hooks/useReportPost", () => ({
  useReportPost: () => ({
    reportTarget: null,
    openReport: jest.fn(),
    closeReport: jest.fn(),
    submitReport: jest.fn(),
  }),
}));

jest.mock("../../hooks/useSharePostViaDM", () => ({
  useSharePostViaDM: () => ({
    shareTarget: null,
    isOpen: false,
    recipients: [],
    searchQuery: "",
    setSearchQuery: jest.fn(),
    handleClearSearch: jest.fn(),
    openShareDM: jest.fn(),
    closeShareDM: jest.fn(),
    handleSelectRecipient: jest.fn(),
    onLoadMore: jest.fn(),
    isLoadingMore: false,
    hasMore: false,
    isSending: false,
  }),
}));

import PostDetailScreen from "../../app/(app)/posts/[postId]/index";
import PostCard from "./PostCard";
import { CommentsHeader } from "../Comments/CommentsHeader";
import { CommentItem } from "../Comments/CommentItem";

describe("PostDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = { postId: "post-123" };
  });

  it("renders the screen, header, post card and comments", () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<PostDetailScreen />);
    });

    const root = renderer!.root;

    // Header with title "Post"
    const header = root.findByType(CommentsHeader);
    expect(header.props.title).toBe("Post");

    // Post card rendered with post content
    const postCard = root.findByType(PostCard);
    expect(postCard.props.body).toBe("Detailed post body here");

    // Comments rendered via CommentItem
    const commentItems = root.findAllByType(CommentItem);
    expect(commentItems).toHaveLength(2);
    expect(commentItems[0].props.comment.body).toBe("First comment");
    expect(commentItems[1].props.comment.body).toBe("Target highlighted comment");
  });

  it("triggers router.back when header back button is pressed", () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<PostDetailScreen />);
    });

    const root = renderer!.root;
    const header = root.findByType(CommentsHeader);
    act(() => {
      header.props.onBack();
    });
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("opens and closes full screen image modal preview on post image press", () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<PostDetailScreen />);
    });

    const root = renderer!.root;
    const postCard = root.findByType(PostCard);

    // Initial state: close button not rendered or previewImageUrl is null
    expect(root.findAllByProps({ accessibilityLabel: "Close image preview" })).toHaveLength(0);

    // Press image on PostCard
    act(() => {
      postCard.props.onPressImage();
    });

    // Modal is now visible with close button
    const closeBtn = root.findByProps({
      accessibilityLabel: "Close image preview",
    });
    expect(closeBtn).toBeDefined();

    const images = root.findAllByType(Image);
    expect(images.length).toBeGreaterThanOrEqual(1);

    // Close modal
    act(() => {
      closeBtn.props.onPress();
    });
    expect(root.findAllByProps({ accessibilityLabel: "Close image preview" })).toHaveLength(0);
  });

  it("highlights the comment when commentId matches", () => {
    mockSearchParams = { postId: "post-123", commentId: "comment-2" };

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<PostDetailScreen />);
    });

    const root = renderer!.root;
    const commentItems = root.findAllByType(CommentItem);
    expect(commentItems).toHaveLength(2);
    expect(commentItems[1].props.comment.id).toBe("comment-2");
  });

  it("opens preview modal with counter when multi-image post image is tapped", () => {
    mockPostCommentsState.post = {
      ...mockPostCommentsState.post,
      media: [
        { id: "m-1", url: "https://example.com/pic1.jpg" },
        { id: "m-2", url: "https://example.com/pic2.jpg" },
      ],
    };

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<PostDetailScreen />);
    });

    const root = renderer!.root;
    const postCard = root.findByType(PostCard);

    // Tap first image index in collage
    act(() => {
      postCard.props.onPressImageIndex(0);
    });

    // Counter "1 of 2" should be rendered
    expect(root.findByProps({ children: "1 of 2" })).toBeDefined();

    // Close preview
    const closeBtn = root.findByProps({
      accessibilityLabel: "Close image preview",
    });
    act(() => {
      closeBtn.props.onPress();
    });
    expect(root.findAllByProps({ children: "1 of 2" })).toHaveLength(0);
  });
});
