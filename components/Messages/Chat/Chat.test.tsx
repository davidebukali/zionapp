import React from "react";
import { TouchableOpacity } from "react-native";
import ReactTestRenderer, { act } from "react-test-renderer";

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
});
