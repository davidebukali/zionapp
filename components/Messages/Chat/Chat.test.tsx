import React from "react";
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
      },
    }),
  };
});

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
} from "./index";
import ChatScreen from "../../../app/(app)/messages/[id]";
import { MOCK_ACTIVE_CONTACTS } from "../../../features/messages/mockData";
import { ChatMessage } from "../../../features/messages/types";

describe("components/Messages/Chat", () => {
  const mockParticipant = MOCK_ACTIVE_CONTACTS[0]; // Maya Chen, online

  describe("ChatHeader", () => {
    it("renders participant name, presence status, and handles back press", () => {
      const onBack = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ChatHeader participant={mockParticipant} onPressBack={onBack} />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Maya Chen");
      expect(json).toContain("Active now");

      const root = renderer!.root;
      const backBtn = root.findByProps({ accessibilityLabel: "Go back" });
      act(() => {
        backBtn.props.onPress();
      });
      expect(onBack).toHaveBeenCalled();
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
