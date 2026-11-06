import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { TouchableOpacity, TextInput } from "react-native";

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
        surface: "#FFFFFF",
        onSurface: "#111111",
        onSurfaceVariant: "#6F6262",
        outlineVariant: "#EFE1E1",
        primary: "#DE3A3A",
        onPrimary: "#FFFFFF",
        surfaceVariant: "#F3EEEE",
        surfaceDisabled: "#E0E0E0",
      },
    }),
  };
});

const mockUseCommentReplies = jest.fn();
jest.mock("../../hooks/useCommentReplies", () => ({
  useCommentReplies: (...args: any[]) => mockUseCommentReplies(...args),
}));

import { CommentItem } from "./CommentItem";
import { CommentReplyItem } from "./CommentReplyItem";
import { CommentInput } from "./CommentInput";
import { Comment } from "../../features/comments/types";

describe("Comments components", () => {
  const mockParentComment: Comment = {
    id: "parent-1",
    postId: "post-100",
    author: "Alice Wonderland",
    username: "alicew",
    body: "First top-level comment",
    likes: 5,
    liked: false,
    replies: 2,
    createdAt: "2026-11-06T10:00:00Z",
  };

  const mockReply: Comment = {
    id: "reply-1",
    postId: "post-100",
    parentCommentId: "parent-1",
    author: "Bob Builder",
    username: "bob_b",
    body: "I agree with Alice!",
    likes: 1,
    liked: true,
    replies: 0,
    createdAt: "2026-11-06T10:05:00Z",
  };

  beforeEach(() => {
    mockUseCommentReplies.mockReturnValue({
      replies: [],
      isExpanded: false,
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      toggleExpand: jest.fn(),
      loadMoreReplies: jest.fn(),
      likeReply: jest.fn(),
    });
  });

  describe("CommentItem", () => {
    it("renders parent comment and reply button", () => {
      const onReply = jest.fn();
      const onLike = jest.fn();

      const tree = ReactTestRenderer.create(
        <CommentItem
          comment={mockParentComment}
          onLike={onLike}
          onReply={onReply}
        />
      );

      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain("Alice Wonderland");
      expect(json).toContain("First top-level comment");
      expect(json).toContain("View 2 replies");

      // Press reply button
      const touchables = tree.root.findAllByType(TouchableOpacity);
      const replyButton = touchables.find(
        (touchable) => touchable.props.accessibilityLabel === "Reply to Alice Wonderland"
      );
      expect(replyButton).toBeDefined();
      act(() => {
        replyButton?.props.onPress();
      });
      expect(onReply).toHaveBeenCalledWith(mockParentComment, mockParentComment);
    });

    it("renders expanded replies and handles toggle", () => {
      const toggleExpand = jest.fn();
      mockUseCommentReplies.mockReturnValue({
        replies: [mockReply],
        isExpanded: true,
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        toggleExpand,
        loadMoreReplies: jest.fn(),
        likeReply: jest.fn(),
      });

      const tree = ReactTestRenderer.create(
        <CommentItem comment={mockParentComment} />
      );

      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain("Hide replies");
      expect(json).toContain("Bob Builder");
      expect(json).toContain("I agree with Alice!");
    });
  });

  describe("CommentReplyItem", () => {
    it("renders reply content and triggers reply action", () => {
      const onReply = jest.fn();
      const onLike = jest.fn();

      const tree = ReactTestRenderer.create(
        <CommentReplyItem
          reply={mockReply}
          onLike={onLike}
          onReply={onReply}
        />
      );

      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain("Bob Builder");
      expect(json).toContain("I agree with Alice!");

      const touchables = tree.root.findAllByType(TouchableOpacity);
      const replyButton = touchables.find(
        (touchable) => touchable.props.accessibilityLabel === "Reply to Bob Builder"
      );
      act(() => {
        replyButton?.props.onPress();
      });
      expect(onReply).toHaveBeenCalledWith(mockReply);
    });
  });

  describe("CommentInput", () => {
    it("renders standard input when not replying", () => {
      const tree = ReactTestRenderer.create(
        <CommentInput
          value=""
          initials="ME"
          onChangeText={jest.fn()}
          onSubmit={jest.fn()}
        />
      );

      const input = tree.root.findByType(TextInput);
      expect(input.props.placeholder).toBe("Add a comment...");
    });

    it("renders reply banner and cancel button when replyingTo is set", () => {
      const onCancelReply = jest.fn();
      const tree = ReactTestRenderer.create(
        <CommentInput
          value="@bob_b "
          initials="ME"
          replyingTo={{ username: "bob_b" }}
          onCancelReply={onCancelReply}
          onChangeText={jest.fn()}
          onSubmit={jest.fn()}
        />
      );

      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain("Replying to");
      expect(json).toContain("@bob_b");

      const input = tree.root.findByType(TextInput);
      expect(input.props.placeholder).toBe("Reply to @bob_b...");

      const cancelButton = tree.root.findAllByType(TouchableOpacity).find(
        (touchable) => touchable.props.accessibilityLabel === "Cancel reply"
      );
      expect(cancelButton).toBeDefined();
      act(() => {
        cancelButton?.props.onPress();
      });
      expect(onCancelReply).toHaveBeenCalledTimes(1);
    });
  });
});

