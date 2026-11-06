import React from "react";
import { Alert, View } from "react-native";
import ReactTestRenderer, { act } from "react-test-renderer";
import * as Haptics from "expo-haptics";
import { useSharePostViaDM } from "./useSharePostViaDM";
import { Post } from "../features/posts/types";
import { OnlineContact } from "../features/messages/types";

jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  NotificationFeedbackType: { Success: "success" },
}));

const mockRouterPush = jest.fn();
jest.mock("expo-router", () => ({
  router: {
    push: (...args: any[]) => mockRouterPush(...args),
  },
}));

const mockStartOrGetConversation = jest.fn();
const mockSendMessage = jest.fn();
const mockUseGetMessageableRecipientsQuery = jest.fn();

jest.mock("../features/messages/api", () => ({
  useStartOrGetConversationMutation: () => [mockStartOrGetConversation],
  useSendMessageMutation: () => [mockSendMessage],
  useGetMessageableRecipientsQuery: (...args: any[]) =>
    mockUseGetMessageableRecipientsQuery(...args),
}));

jest.mock("react-redux", () => ({
  useSelector: jest.fn((selector) =>
    selector({
      auth: { token: "fake-jwt-token" },
    })
  ),
}));

function TestConsumer({
  onHookResult,
}: {
  onHookResult: (res: ReturnType<typeof useSharePostViaDM>) => void;
}) {
  const result = useSharePostViaDM();
  onHookResult(result);
  return <View />;
}

describe("useSharePostViaDM", () => {
  const mockPost: Post = {
    id: "post-123",
    title: "Scenic Views",
    author: "Alice",
    authorId: "user-alice",
    content: "Golden sunrise over the horizon.",
    createdAt: "2026-11-06T10:00:00Z",
    updatedAt: "2026-11-06T10:00:00Z",
    likes: "10",
    comments: "2",
    liked: false,
    isReposted: false,
    repostsCount: 0,
    bookmarked: false,
  };

  const mockContact: OnlineContact = {
    id: "user-bob",
    name: "Bob",
    username: "bob",
    initials: "B",
    isOnline: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseGetMessageableRecipientsQuery.mockReturnValue({
      data: {
        recipients: [mockContact],
        nextCursor: null,
      },
      isLoading: false,
      isFetching: false,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("initializes with closed sheet and empty query", () => {
    let hookResult: ReturnType<typeof useSharePostViaDM> | undefined;
    act(() => {
      ReactTestRenderer.create(
        <TestConsumer
          onHookResult={(res) => {
            hookResult = res;
          }}
        />
      );
    });

    expect(hookResult?.isOpen).toBe(false);
    expect(hookResult?.shareTarget).toBeNull();
    expect(hookResult?.searchQuery).toBe("");
  });

  it("opens share sheet and closes it cleanly", () => {
    let hookResult: ReturnType<typeof useSharePostViaDM> | undefined;
    act(() => {
      ReactTestRenderer.create(
        <TestConsumer
          onHookResult={(res) => {
            hookResult = res;
          }}
        />
      );
    });

    act(() => {
      hookResult?.openShareDM(mockPost);
      jest.runAllTimers();
    });

    expect(hookResult?.isOpen).toBe(true);
    expect(hookResult?.shareTarget).toEqual(mockPost);

    act(() => {
      hookResult?.closeShareDM();
    });

    expect(hookResult?.isOpen).toBe(false);
    expect(hookResult?.shareTarget).toBeNull();
  });

  it("sends post reference tag immediately upon selecting a recipient", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    mockStartOrGetConversation.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ id: "conv-456", recipient: mockContact }),
    });
    mockSendMessage.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ id: "msg-789" }),
    });

    let hookResult: ReturnType<typeof useSharePostViaDM> | undefined;
    act(() => {
      ReactTestRenderer.create(
        <TestConsumer
          onHookResult={(res) => {
            hookResult = res;
          }}
        />
      );
    });

    act(() => {
      hookResult?.openShareDM(mockPost);
      jest.runAllTimers();
    });

    await act(async () => {
      await hookResult?.handleSelectRecipient(mockContact);
    });

    expect(mockStartOrGetConversation).toHaveBeenCalledWith({
      recipient_id: "user-bob",
    });
    expect(mockSendMessage).toHaveBeenCalledWith({
      conversationId: "conv-456",
      body: "[zion:post:post-123]",
    });
    expect(Haptics.notificationAsync).toHaveBeenCalled();
    expect(hookResult?.isOpen).toBe(false);

    act(() => {
      jest.runAllTimers();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Post Shared",
      "Sent to Bob",
      expect.any(Array)
    );

    // Test View Chat navigation button callback
    const alertButtons = alertSpy.mock.calls[0][2] as any[];
    const viewChatBtn = alertButtons.find((b) => b.text === "View Chat");
    expect(viewChatBtn).toBeDefined();

    act(() => {
      viewChatBtn.onPress();
    });

    expect(mockRouterPush).toHaveBeenCalledWith("/messages/user-bob");
  });

  it("handles errors gracefully when conversation creation or sending fails", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    mockStartOrGetConversation.mockReturnValue({
      unwrap: jest.fn().mockRejectedValue(new Error("Network Error")),
    });

    let hookResult: ReturnType<typeof useSharePostViaDM> | undefined;
    act(() => {
      ReactTestRenderer.create(
        <TestConsumer
          onHookResult={(res) => {
            hookResult = res;
          }}
        />
      );
    });

    act(() => {
      hookResult?.openShareDM(mockPost);
      jest.runAllTimers();
    });

    await act(async () => {
      await hookResult?.handleSelectRecipient(mockContact);
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Error",
      "Failed to share post. Please try again."
    );
    expect(hookResult?.isSending).toBe(false);
  });
});

