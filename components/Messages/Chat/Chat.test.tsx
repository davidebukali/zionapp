import React from "react";
import { FlatList, TouchableOpacity } from "react-native";
import ReactTestRenderer, { act } from "react-test-renderer";
import { Swipeable } from "react-native-gesture-handler";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
    canGoBack: jest.fn().mockReturnValue(true),
  },
  useLocalSearchParams: () => ({ id: "conv-1" }),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 40, bottom: 20, left: 0, right: 0 }),
}));
jest.mock("rn-emoji-keyboard", () => "EmojiPicker");
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
        outlineVariant: "#EFE1E1",
        background: "#000000",
        onBackground: "#FFFFFF",
        onPrimary: "#FFFFFF",
        inverseSurface: "#FFFFFF",
        inverseOnSurface: "#121212",
      },
    }),
  };
});

jest.mock("../../../hooks/useChatThread", () => ({
  useChatThread: jest.fn(() => ({
    participant: {
      id: "user-maya",
      name: "Maya Chen",
      username: "mayachen",
      initials: "MC",
      isOnline: true,
      avatarColor: "#7CB342",
    },
    messages: [
      {
        id: "msg-1",
        senderId: "user-maya",
        isOutgoing: false,
        text: "okay but the new banner colors are 🔥🔥",
        timestamp: "9:12",
      },
    ],
    inputText: "",
    setInputText: jest.fn(),
    isTyping: true,
    setIsTyping: jest.fn(),
    isEmojiPickerOpen: false,
    setIsEmojiPickerOpen: jest.fn(),
    handleToggleEmoji: jest.fn(),
    handleEmojiSelected: jest.fn(),
    handleSendMessage: jest.fn(),
    handleBack: jest.fn(),
    canSendMessages: true,
    isLoading: false,
    isLoadingMore: false,
    hasMore: false,
    onLoadMore: jest.fn(),
    isOptionsOpen: false,
    isMuted: false,
    isArchived: false,
    isBlocked: false,
    isDraft: false,
    handleOpenOptions: jest.fn(),
    handleCloseOptions: jest.fn(),
    handleToggleMute: jest.fn(),
    handleToggleArchive: jest.fn(),
    handleClearHistory: jest.fn(),
    handleReport: jest.fn(),
    handleToggleBlock: jest.fn(),
    selectedMedia: [],
    handlePickMedia: jest.fn(),
    handleRemoveMedia: jest.fn(),
    isUploadingMedia: false,
    uploadStatusText: null,
  })),
}));

jest.mock("../../../hooks/useMessageActions", () => ({
  useMessageActions: jest.fn(() => ({
    actionMessage: null,
    handleOpenMessageActions: jest.fn(),
    handleCloseMessageActions: jest.fn(),
    handleCopyMessage: jest.fn(),
    handleReportMessage: jest.fn(),
    handleDeleteMessage: jest.fn(),
  })),
}));

jest.mock("react-redux", () => ({
  useSelector: jest.fn(() => ({})),
  useDispatch: () => jest.fn(),
  useStore: () => ({
    getState: () => ({}),
    subscribe: () => () => {},
    dispatch: jest.fn(),
  }),
}));

jest.mock("../../../features/posts/api", () => ({
  useGetPostQuery: jest.fn((postId: string) => ({
    data: {
      id: postId,
      title: "Golden Hour Summit",
      author: "Jane Doe",
      authorId: "user-jane",
      content: "Stunning mountain views from today's trail climb.",
      createdAt: "2026-11-05T10:00:00Z",
      imageUrl: "https://example.com/mountain.jpg",
      likes: "25",
      comments: "4",
      liked: false,
    },
    isLoading: false,
    isError: false,
  })),
}));

import {
  ChatHeader,
  ChatDateSeparator,
  ChatReactionBadge,
  ChatReadReceipt,
  ChatTextBubble,
  ChatMediaBubble,
  ChatMessageBubble,
  ChatTypingIndicator,
  ChatComposer,
  ChatMessageList,
  ChatThreadOptionsSheet,
  ChatMessageActionSheet,
  QuickReactionBar,
  ChatReplySnippet,
  ChatPostCard,
  ChatPostCardAuthorRow,
  ChatPostCardImage,
  ChatPostCardLoading,
  ChatPostCardUnavailable,
} from "./index";
import ChatScreen from "../../../app/(app)/messages/[id]";
import { ChatMessage, OnlineContact } from "../../../features/messages/types";

describe("components/Messages/Chat", () => {
  const mockParticipant: OnlineContact = {
    id: "user-maya",
    name: "Maya Chen",
    username: "mayachen",
    initials: "MC",
    isOnline: true,
    avatarColor: "#7CB342",
  };

  describe("ChatHeader", () => {
    it("renders participant name, presence status, and handles back and options press", () => {
      const onBack = jest.fn();
      const onOptions = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatHeader
            participant={mockParticipant}
            onPressBack={onBack}
            isMuted={true}
            onPressOptions={onOptions}
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Maya Chen");
      expect(json).toContain("Active now");
      expect(json).toContain("volume-mute-outline");

      const root = renderer!.root;
      const backBtn = root.findByProps({ accessibilityLabel: "Go back" });
      act(() => {
        backBtn.props.onPress();
      });
      expect(onBack).toHaveBeenCalled();

      const optionsBtn = root.findByProps({ accessibilityLabel: "Thread options" });
      act(() => {
        optionsBtn.props.onPress();
      });
      expect(onOptions).toHaveBeenCalled();
    });
  });

  describe("ChatDateSeparator", () => {
    it("renders date label", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatDateSeparator label="Today · 9:12" />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Today · 9:12");
    });
  });

  describe("ChatReactionBadge", () => {
    it("renders reaction emoji badge", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatReactionBadge reactions={["❤️"]} />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("❤️");
    });
  });

  describe("ChatReadReceipt", () => {
    it("renders read receipt text", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatReadReceipt text="Read 9:14 · ❤️" />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Read 9:14 · ❤️");
    });
  });

  describe("ChatTextBubble", () => {
    it("renders outgoing text bubble", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatTextBubble text="outgoing test" isOutgoing={true} />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("outgoing test");
    });

    it("renders incoming text bubble", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatTextBubble text="incoming test" isOutgoing={false} />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("incoming test");
    });
  });

  describe("ChatMediaBubble", () => {
    it("renders image attachment card", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatMediaBubble mediaUrl="https://example.com/banner.jpg" />
        );
      });

      const root = renderer!.root;
      const img = root.findByProps({ resizeMode: "cover" });
      expect(img.props.source.uri).toBe("https://example.com/banner.jpg");
    });

    it("renders multi-image grid when multiple mediaUrls are provided", () => {
      const urls = [
        "https://example.com/img1.jpg",
        "https://example.com/img2.jpg",
        "https://example.com/img3.jpg",
      ];
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatMediaBubble mediaUrls={urls} />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("https://example.com/img1.jpg");
      expect(json).toContain("https://example.com/img2.jpg");
      expect(json).toContain("https://example.com/img3.jpg");
    });

    it("calls onPressMedia with urls and index 0 when single image is tapped", () => {
      const handlePressMedia = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatMediaBubble
            mediaUrl="https://example.com/banner.jpg"
            onPressMedia={handlePressMedia}
          />
        );
      });

      const button = renderer!.root.findByProps({ accessibilityLabel: "View photo" });
      act(() => {
        button.props.onPress();
      });

      expect(handlePressMedia).toHaveBeenCalledWith(
        ["https://example.com/banner.jpg"],
        0
      );
    });

    it("calls onPressMedia with all urls and target index when a grid tile is tapped", () => {
      const handlePressMedia = jest.fn();
      const urls = [
        "https://example.com/img1.jpg",
        "https://example.com/img2.jpg",
      ];
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatMediaBubble mediaUrls={urls} onPressMedia={handlePressMedia} />
        );
      });

      const button = renderer!.root.findByProps({
        accessibilityLabel: "View photo 2",
      });
      act(() => {
        button.props.onPress();
      });

      expect(handlePressMedia).toHaveBeenCalledWith(urls, 1);
    });
  });

  describe("ChatMessageBubble", () => {
    it("renders composite message with reactions and read receipt", () => {
      const msg: ChatMessage = {
        id: "msg-test",
        senderId: "current-user",
        isOutgoing: true,
        text: "hello world",
        timestamp: "9:14",
        reactions: ["❤️"],
        readReceipt: "Read 9:14",
      };

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(<ChatMessageBubble message={msg} />);
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("hello world");
      expect(json).toContain("❤️");
      expect(json).toContain("Read 9:14");
    });

    it("forwards onPressMedia to ChatMediaBubble for media messages", () => {
      const handlePressMedia = jest.fn();
      const msg: ChatMessage = {
        id: "msg-media",
        senderId: "other-user",
        isOutgoing: false,
        mediaUrl: "https://example.com/received.jpg",
        timestamp: "9:15",
      };

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatMessageBubble message={msg} onPressMedia={handlePressMedia} />
        );
      });

      const button = renderer!.root.findByProps({ accessibilityLabel: "View photo" });
      act(() => {
        button.props.onPress();
      });

      expect(handlePressMedia).toHaveBeenCalledWith(
        ["https://example.com/received.jpg"],
        0
      );
    });
  });

  describe("ChatTypingIndicator", () => {
    it("renders typing dots and participant avatar", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatTypingIndicator participant={mockParticipant} visible={true} />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("•••");
      expect(json).toContain("MC");
    });
  });

  describe("ChatComposer", () => {
    it("updates input text and triggers send", () => {
      const onSend = jest.fn();
      const onChange = jest.fn();
      const onEmoji = jest.fn();

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatComposer
            text="new message"
            onChangeText={onChange}
            onSend={onSend}
            onToggleEmoji={onEmoji}
          />
        );
      });

      const root = renderer!.root;
      const sendBtn = root.findByProps({ accessibilityLabel: "Send message" });
      expect(sendBtn.props.disabled).toBe(false);

      act(() => {
        sendBtn.props.onPress();
      });
      expect(onSend).toHaveBeenCalled();

      const emojiBtn = root.findByProps({ accessibilityLabel: "Add emoji" });
      act(() => {
        emojiBtn.props.onPress();
      });
      expect(onEmoji).toHaveBeenCalled();
    });

    it("renders media thumbnails, handles remove, and disables caption typing when images are attached", () => {
      const onRemoveMedia = jest.fn();
      const onPickMedia = jest.fn();
      const onSend = jest.fn();

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatComposer
            text="Trying to type caption"
            onChangeText={jest.fn()}
            onSend={onSend}
            onToggleEmoji={jest.fn()}
            selectedMedia={[{ uri: "file://photo1.jpg" }, { uri: "file://photo2.jpg" }]}
            onPickMedia={onPickMedia}
            onRemoveMedia={onRemoveMedia}
          />
        );
      });

      const root = renderer!.root;
      const removeButtons = root
        .findAllByType(TouchableOpacity)
        .filter((node) => node.props.accessibilityLabel === "Remove photo");
      expect(removeButtons.length).toBe(2);

      act(() => {
        removeButtons[0].props.onPress();
      });
      expect(onRemoveMedia).toHaveBeenCalledWith(0);

      // Verify text input is disabled (no caption allowed)
      const input = root.findByProps({ accessibilityLabel: "Message input" });
      expect(input.props.editable).toBe(false);
      expect(input.props.value).toBe("");
      expect(input.props.placeholder).toBe("Photos ready to send (no captions)");

      // Send button is enabled even though text is empty
      const sendBtn = root.findByProps({ accessibilityLabel: "Send message" });
      expect(sendBtn.props.disabled).toBe(false);
    });

    it("renders upload indicator when isUploadingMedia is true", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatComposer
            text=""
            onChangeText={jest.fn()}
            onSend={jest.fn()}
            onToggleEmoji={jest.fn()}
            selectedMedia={[{ uri: "file://photo1.jpg" }]}
            isUploadingMedia={true}
            uploadStatusText="Uploading 1 of 1..."
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Uploading 1 of 1...");
    });
  });

  describe("ChatThreadOptionsSheet", () => {
    it("renders options and triggers action handlers", () => {
      const onToggleMute = jest.fn();
      const onToggleArchive = jest.fn();
      const onClearHistory = jest.fn();
      const onToggleBlock = jest.fn();
      const onReport = jest.fn();
      const onClose = jest.fn();

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatThreadOptionsSheet
            visible={true}
            participant={mockParticipant}
            isMuted={false}
            isArchived={false}
            isBlocked={false}
            onClose={onClose}
            onToggleMute={onToggleMute}
            onToggleArchive={onToggleArchive}
            onClearHistory={onClearHistory}
            onReport={onReport}
            onToggleBlock={onToggleBlock}
          />
        );
      });

      const root = renderer!.root;

      // Mute
      const muteBtn = root.findByProps({ accessibilityLabel: "Mute notifications" });
      act(() => {
        muteBtn.props.onPress();
      });
      expect(onToggleMute).toHaveBeenCalled();

      // Archive
      const archiveBtn = root.findByProps({ accessibilityLabel: "Archive conversation" });
      act(() => {
        archiveBtn.props.onPress();
      });
      expect(onToggleArchive).toHaveBeenCalled();

      // Clear History
      const clearBtn = root.findByProps({ accessibilityLabel: "Clear chat history" });
      act(() => {
        clearBtn.props.onPress();
      });
      expect(onClearHistory).toHaveBeenCalled();

      // Block
      const blockBtn = root.findByProps({ accessibilityLabel: "Block user" });
      act(() => {
        blockBtn.props.onPress();
      });
      expect(onToggleBlock).toHaveBeenCalled();

      // Open report flow
      const reportTrigger = root.findByProps({ accessibilityLabel: "Report conversation" });
      act(() => {
        reportTrigger.props.onPress();
      });

      // Select Spam report reason
      const spamReasonBtn = root.findByProps({ accessibilityLabel: "Report as Spam or Scam" });
      act(() => {
        spamReasonBtn.props.onPress();
      });
      expect(onReport).toHaveBeenCalledWith("spam");
    });

    it("hides thread-specific actions (mute, archive, clear) when isDraft is true", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatThreadOptionsSheet
            visible={true}
            participant={mockParticipant}
            isMuted={false}
            isArchived={false}
            isBlocked={false}
            isDraft={true}
            onClose={jest.fn()}
            onToggleMute={jest.fn()}
            onToggleArchive={jest.fn()}
            onClearHistory={jest.fn()}
            onReport={jest.fn()}
            onToggleBlock={jest.fn()}
          />
        );
      });

      const root = renderer!.root;

      // Hidden for drafts
      expect(() => root.findByProps({ accessibilityLabel: "Mute notifications" })).toThrow();
      expect(() => root.findByProps({ accessibilityLabel: "Archive conversation" })).toThrow();
      expect(() => root.findByProps({ accessibilityLabel: "Clear chat history" })).toThrow();

      // Visible for drafts
      expect(root.findByProps({ accessibilityLabel: "Report conversation" })).toBeDefined();
      expect(root.findByProps({ accessibilityLabel: "Block user" })).toBeDefined();
    });
  });

  describe("ChatMessageList", () => {
    it("renders message list and date separator", () => {
      const messages: ChatMessage[] = [
        {
          id: "m-1",
          senderId: "user-maya",
          isOutgoing: false,
          text: "list message",
          timestamp: "9:12",
        },
      ];

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatMessageList
            messages={messages}
            participant={mockParticipant}
            dateLabel="Today · 9:12"
          />
        );
      });

      const root = renderer!.root;
      const flatList = root.findByType(FlatList);
      expect(flatList.props.inverted).toBe(true);
      expect(root.findByProps({ label: "Today · 9:12" })).toBeDefined();
      expect(root.findByProps({ visible: true })).toBeDefined();
    });
  });

  describe("ChatScreen", () => {
    it("renders chat screen route with header, message stream, and composer", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(<ChatScreen />);
      });

      const root = renderer!.root;
      const backBtn = root.findByProps({ accessibilityLabel: "Go back" });
      expect(backBtn).toBeDefined();

      const composerInput = root.findByProps({
        accessibilityLabel: "Message input",
      });
      expect(composerInput).toBeDefined();

      const sendBtn = root.findByProps({ accessibilityLabel: "Send message" });
      expect(sendBtn).toBeDefined();
    });
  });

  describe("ChatPostCard", () => {
    it("renders post card details with image, author, (1d), truncated body, and navigates on tap", () => {
      const { router } = require("expo-router");
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatPostCard postId="post-123" isOutgoing={false} />
        );
      });

      const root = renderer!.root;
      const card = root.findByProps({
        accessibilityLabel: "Post by Jane Doe",
      });
      expect(card).toBeDefined();

      // Check author name, relative time, and truncated body
      expect(root.findByProps({ children: "Jane Doe" })).toBeDefined();
      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toMatch(/\(\d+d\)/);
      expect(
        root.findByProps({
          children: "Stunning mountain views from today's trail climb.",
        })
      ).toBeDefined();

      act(() => {
        card.props.onPress();
      });
      expect(router.push).toHaveBeenCalledWith({
        pathname: "/posts/[postId]",
        params: { postId: "post-123" },
      });
    });

    it("renders fallback state when post is unavailable", () => {
      const { useGetPostQuery } = require("../../../features/posts/api");
      useGetPostQuery.mockReturnValueOnce({
        data: null,
        isLoading: false,
        isError: true,
      });

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatPostCard postId="post-deleted" isOutgoing={false} />
        );
      });

      const root = renderer!.root;
      expect(
        root.findByProps({ children: "This post is unavailable" })
      ).toBeDefined();
    });
  });

  describe("ChatPostCardAuthorRow", () => {
    it("renders author avatar, name aligned left, and relative timestamp", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatPostCardAuthorRow
            author="Alice Walker"
            avatarUrl="https://example.com/alice.jpg"
            createdAt="2026-11-05T10:00:00Z"
          />
        );
      });

      const root = renderer!.root;
      expect(root.findByProps({ children: "Alice Walker" })).toBeDefined();
      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("https://example.com/alice.jpg");
      expect(json).toContain("flex-start");
    });

    it("renders initials fallback when avatarUrl is absent", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatPostCardAuthorRow
            author="Bob Miller"
            createdAt="2026-11-06T10:00:00Z"
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("BM");
      expect(json).toContain("Bob Miller");
    });
  });

  describe("ChatPostCardImage", () => {
    it("renders image with cover mode when imageUrl is given", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatPostCardImage imageUrl="https://example.com/banner.jpg" />
        );
      });

      const root = renderer!.root;
      const img = root.findByProps({ resizeMode: "cover" });
      expect(img.props.source.uri).toBe("https://example.com/banner.jpg");
    });

    it("returns null when imageUrl is omitted", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatPostCardImage />
        );
      });

      expect(renderer!.toJSON()).toBeNull();
    });
  });

  describe("ChatPostCardStates", () => {
    it("renders loading indicator with card width", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatPostCardLoading width={280} />
        );
      });

      const root = renderer!.root;
      expect(root.findByProps({ size: "small" })).toBeDefined();
    });

    it("renders unavailable text with card width", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatPostCardUnavailable width={280} />
        );
      });

      const root = renderer!.root;
      expect(root.findByProps({ children: "This post is unavailable" })).toBeDefined();
    });
  });

  describe("ChatMessageBubble with sharedPostId", () => {
    it("renders ChatPostCard and companion text inside the message bubble", () => {
      const message: ChatMessage = {
        id: "msg-shared-1",
        senderId: "user-maya",
        isOutgoing: false,
        text: "Check this out!",
        timestamp: "10:30",
        sharedPostId: "post-123",
      };

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatMessageBubble message={message} />
        );
      });

      const root = renderer!.root;
      const postCard = root.findByProps({
        accessibilityLabel: "Post by Jane Doe",
      });
      expect(postCard).toBeDefined();

      // Companion text is rendered above the post card
      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Check this out!");
    });
  });

  describe("ChatReplySnippet", () => {
    it("renders composer banner with sender name, text, and handles onCancel", () => {
      const onCancelMock = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatReplySnippet
            senderName="Maya Chen"
            text="Hello world"
            onCancel={onCancelMock}
          />
        );
      });

      const root = renderer!.root;
      const cancelButton = root.findByProps({
        accessibilityLabel: "Cancel reply",
      });
      expect(cancelButton).toBeDefined();

      act(() => {
        cancelButton.props.onPress();
      });
      expect(onCancelMock).toHaveBeenCalledTimes(1);

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Maya Chen");
      expect(json).toContain("Hello world");
    });

    it("renders thumbnail image when mediaUrl is provided", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatReplySnippet
            senderName="You"
            text=""
            mediaUrl="https://example.com/reply-thumb.jpg"
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("https://example.com/reply-thumb.jpg");
      expect(json).toContain("📷 Photo");
    });

    it("formats raw [zion:post:...] tag as 'Shared post' in quote snippet", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatReplySnippet
            senderName="dave"
            text="[zion:post:post-999]"
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("dave");
      expect(json).toContain("Shared post");
      expect(json).not.toContain("[zion:post:post-999]");
    });

    it("extracts companion caption when [zion:post:...] contains text", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatReplySnippet
            senderName="dave"
            text="[zion:post:post-999] Sunday service recap"
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Sunday service recap");
      expect(json).not.toContain("[zion:post:post-999]");
    });
  });

  describe("ChatReactionBadge enhancements", () => {
    it("displays count only when multiple reactions exist", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatReactionBadge
            rawReactions={[
              { emoji: "❤️", count: 1, user_reacted: false },
              { emoji: "👍", count: 3, user_reacted: true },
            ]}
          />
        );
      });

      const root = renderer!.root;
      const singleBadge = root.findByProps({
        accessibilityLabel: "Reaction ❤️",
      });
      const multiBadge = root.findByProps({
        accessibilityLabel: "Reaction 👍, count 3",
      });
      expect(singleBadge).toBeDefined();
      expect(multiBadge).toBeDefined();
    });

    it("triggers onPressReaction callback when a reaction pill is tapped", () => {
      const onPressReactionMock = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatReactionBadge
            rawReactions={[{ emoji: "😂", count: 2, user_reacted: true }]}
            onPressReaction={onPressReactionMock}
          />
        );
      });

      const root = renderer!.root;
      const badge = root.findByProps({
        accessibilityLabel: "Reaction 😂, count 2",
      });
      act(() => {
        badge.props.onPress();
      });
      expect(onPressReactionMock).toHaveBeenCalledWith("😂");
    });
  });

  describe("ChatMessageBubble with reply & reactions", () => {
    it("renders replied message snippet above the current text", () => {
      const message: ChatMessage = {
        id: "msg-reply-1",
        senderId: "user-current",
        isOutgoing: true,
        text: "I completely agree with this!",
        timestamp: "9:15",
        replyTo: {
          id: "msg-orig-1",
          sender: { id: "user-maya", name: "Maya Chen" },
          body: "Let us meet at 5 PM",
          is_deleted_for_everyone: false,
        },
      };

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatMessageBubble message={message} />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Maya Chen");
      expect(json).toContain("Let us meet at 5 PM");
      expect(json).toContain("I completely agree with this!");
    });

    it("renders ChatReactionBadge attached to the bubble when reactions are present", () => {
      const message: ChatMessage = {
        id: "msg-rx-1",
        senderId: "user-current",
        isOutgoing: true,
        text: "Amen!",
        timestamp: "9:18",
        reactions: ["❤️"],
        rawReactions: [{ emoji: "❤️", count: 1, user_reacted: true }],
      };

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatMessageBubble message={message} />
        );
      });

      const root = renderer!.root;
      const reactionBadge = root.findByProps({
        accessibilityLabel: "Reaction ❤️",
      });
      expect(reactionBadge).toBeDefined();
    });

    it("fires onLongPress callback when message is long-pressed", () => {
      const onLongPressMock = jest.fn();
      const message: ChatMessage = {
        id: "msg-longpress-1",
        senderId: "user-maya",
        isOutgoing: false,
        text: "Praise the Lord!",
        timestamp: "9:20",
      };

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatMessageBubble
            message={message}
            onLongPress={onLongPressMock}
          />
        );
      });

      const root = renderer!.root;
      const touchable = root.findByProps({ delayLongPress: 250 });
      act(() => {
        touchable.props.onLongPress();
      });

      expect(onLongPressMock).toHaveBeenCalledWith(message);
    });

    it("disables long-press when message is pending or deleted for everyone", () => {
      const onLongPressMock = jest.fn();
      const deletedMessage: ChatMessage = {
        id: "msg-deleted-1",
        senderId: "user-maya",
        isOutgoing: false,
        text: "Deleted",
        timestamp: "9:20",
        isDeletedForEveryone: true,
      };

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatMessageBubble
            message={deletedMessage}
            onLongPress={onLongPressMock}
          />
        );
      });

      const touchable = renderer!.root.findByProps({ delayLongPress: 250 });
      expect(touchable.props.disabled).toBe(true);

      const pendingMessage: ChatMessage = {
        id: "temp-12345",
        senderId: "user-me",
        isOutgoing: true,
        text: "Sending...",
        timestamp: "9:21",
      };
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatMessageBubble
            message={pendingMessage}
            onLongPress={onLongPressMock}
          />
        );
      });
      const pendingTouchable = renderer!.root.findByProps({
        delayLongPress: 250,
      });
      expect(pendingTouchable.props.disabled).toBe(true);
    });

    it("calls onReply when swiped to the right", () => {
      const onReplyMock = jest.fn();
      const message: ChatMessage = {
        id: "msg-swipe-1",
        senderId: "user-maya",
        isOutgoing: false,
        text: "Swipe to reply test",
        timestamp: "9:30",
      };

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatMessageBubble message={message} onReply={onReplyMock} />
        );
      });

      const root = renderer!.root;
      const swipeable = root.findByType(Swipeable);
      act(() => {
        swipeable.props.onSwipeableOpen("left");
      });

      expect(onReplyMock).toHaveBeenCalledWith(message);
    });
  });

  describe("QuickReactionBar", () => {
    it("renders emoji reactions and more button", () => {
      const onSelectEmojiMock = jest.fn();
      const onPressMoreMock = jest.fn();

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <QuickReactionBar
            onSelectEmoji={onSelectEmojiMock}
            onPressMore={onPressMoreMock}
          />
        );
      });

      const root = renderer!.root;
      const heartBtn = root.findByProps({
        accessibilityLabel: "React with ❤️",
      });
      act(() => {
        heartBtn.props.onPress();
      });
      expect(onSelectEmojiMock).toHaveBeenCalledWith("❤️");

      const moreBtn = root.findByProps({
        accessibilityLabel: "More reactions",
      });
      act(() => {
        moreBtn.props.onPress();
      });
      expect(onPressMoreMock).toHaveBeenCalled();
    });
  });

  describe("ChatMessageActionSheet", () => {
    const mockMessage: ChatMessage = {
      id: "msg-action-1",
      senderId: "user-maya",
      isOutgoing: false,
      text: "Bless you!",
      timestamp: "10:00",
    };

    it("renders quick reactions, copy, report and delete buttons for incoming messages", () => {
      const onCopyMock = jest.fn();
      const onDeleteMock = jest.fn();
      const onReportMock = jest.fn();
      const onReactMock = jest.fn();
      const onOpenReactionPickerMock = jest.fn();
      const onCloseMock = jest.fn();

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatMessageActionSheet
            message={mockMessage}
            onClose={onCloseMock}
            onReact={onReactMock}
            onOpenReactionPicker={onOpenReactionPickerMock}
            onCopy={onCopyMock}
            onReport={onReportMock}
            onDelete={onDeleteMock}
          />
        );
      });

      const root = renderer!.root;

      // Copy Text
      const copyBtn = root.findByProps({
        accessibilityLabel: "Copy message text",
      });
      act(() => {
        copyBtn.props.onPress();
      });
      expect(onCopyMock).toHaveBeenCalledWith(mockMessage);

      // Delete Message
      const deleteBtn = root.findByProps({
        accessibilityLabel: "Delete message",
      });
      act(() => {
        deleteBtn.props.onPress();
      });
      expect(onDeleteMock).toHaveBeenCalledWith(mockMessage);
    });

    it("hides copy button when message has no text and hides report button for outgoing message", () => {
      const outgoingNoTextMessage: ChatMessage = {
        id: "msg-out-no-text",
        senderId: "user-me",
        isOutgoing: true,
        timestamp: "10:05",
      };

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatMessageActionSheet
            message={outgoingNoTextMessage}
            onClose={jest.fn()}
            onReact={jest.fn()}
            onOpenReactionPicker={jest.fn()}
            onCopy={jest.fn()}
            onReport={jest.fn()}
            onDelete={jest.fn()}
          />
        );
      });

      const root = renderer!.root;
      expect(() =>
        root.findByProps({ accessibilityLabel: "Copy message text" })
      ).toThrow();
      expect(() =>
        root.findByProps({ accessibilityLabel: "Report message" })
      ).toThrow();
      expect(
        root.findByProps({ accessibilityLabel: "Delete message" })
      ).toBeDefined();
    });

    it("transitions to report reasons view when report button is pressed", () => {
      const onReportMock = jest.fn();

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatMessageActionSheet
            message={mockMessage}
            onClose={jest.fn()}
            onReact={jest.fn()}
            onOpenReactionPicker={jest.fn()}
            onCopy={jest.fn()}
            onReport={onReportMock}
            onDelete={jest.fn()}
          />
        );
      });

      const root = renderer!.root;
      const reportBtn = root.findByProps({
        accessibilityLabel: "Report message",
      });
      act(() => {
        reportBtn.props.onPress();
      });

      const spamOption = root.findByProps({
        accessibilityLabel: "Report as Spam or Scam",
      });
      expect(spamOption).toBeDefined();

      act(() => {
        spamOption.props.onPress();
      });
      expect(onReportMock).toHaveBeenCalledWith(mockMessage, "spam");
    });
  });

  describe("ChatComposer with replyingTo", () => {
    it("renders floating reply preview banner and handles cancel", () => {
      const onCancelReplyMock = jest.fn();
      const replyingMessage: ChatMessage = {
        id: "msg-replying-1",
        senderId: "user-maya",
        isOutgoing: false,
        text: "Are you attending Sunday service?",
        timestamp: "9:00",
      };

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatComposer
            text=""
            onChangeText={jest.fn()}
            onSend={jest.fn()}
            onToggleEmoji={jest.fn()}
            replyingTo={replyingMessage}
            participantName="Maya Chen"
            onCancelReply={onCancelReplyMock}
          />
        );
      });

      const root = renderer!.root;
      const cancelButton = root.findByProps({
        accessibilityLabel: "Cancel reply",
      });
      expect(cancelButton).toBeDefined();

      act(() => {
        cancelButton.props.onPress();
      });
      expect(onCancelReplyMock).toHaveBeenCalledTimes(1);

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Maya Chen");
      expect(json).toContain("Are you attending Sunday service?");
    });
  });
});
