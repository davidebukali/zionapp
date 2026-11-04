import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";

import { Conversation, OnlineContact } from "../../features/messages/types";

const MOCK_ACTIVE_CONTACTS: OnlineContact[] = [
  {
    id: "user-maya",
    name: "Maya Chen",
    username: "mayachen",
    initials: "MC",
    isOnline: true,
    avatarColor: "#7CB342",
  },
  {
    id: "user-studio",
    name: "Studio North",
    username: "studionorth",
    initials: "SN",
    isOnline: false,
    avatarColor: "#E64A19",
  },
  {
    id: "user-dev",
    name: "Dev Patel",
    username: "devpatel",
    initials: "DP",
    isOnline: true,
    avatarColor: "#8BC34A",
  },
  {
    id: "user-jordan",
    name: "Jordan Vélez",
    username: "jordanvelez",
    initials: "JV",
    isOnline: false,
    avatarColor: "#9E9D24",
  },
  {
    id: "user-riya",
    name: "Riya Kapoor",
    username: "riyakapoor",
    initials: "RK",
    isOnline: false,
    avatarColor: "#F4511E",
  },
];

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    participant: MOCK_ACTIVE_CONTACTS[0],
    lastMessage: {
      text: "haha okay sending it now",
      type: "text",
      timestamp: "2m",
    },
    unreadCount: 2,
  },
  {
    id: "conv-2",
    participant: MOCK_ACTIVE_CONTACTS[1],
    lastMessage: {
      text: "love that direction",
      type: "outgoing",
      timestamp: "1h",
    },
    unreadCount: 0,
  },
  {
    id: "conv-3",
    participant: MOCK_ACTIVE_CONTACTS[2],
    lastMessage: {
      text: "reacted ❤️ to your message",
      type: "reaction",
      timestamp: "3h",
      reactionEmoji: "❤️",
    },
    unreadCount: 1,
  },
  {
    id: "conv-4",
    participant: MOCK_ACTIVE_CONTACTS[3],
    lastMessage: {
      text: "let's pick this up tomorrow",
      type: "text",
      timestamp: "1d",
    },
    unreadCount: 0,
  },
  {
    id: "conv-5",
    participant: MOCK_ACTIVE_CONTACTS[4],
    lastMessage: {
      text: "Photo",
      type: "photo",
      timestamp: "2d",
    },
    unreadCount: 0,
  },
];

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: "light" },
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 40, bottom: 20, left: 0, right: 0 }),
}));
jest.mock("../../hooks/useMessages", () => ({
  useMessages: jest.fn(() => ({
    searchQuery: "",
    setSearchQuery: jest.fn(),
    handleClearSearch: jest.fn(),
    conversations: MOCK_CONVERSATIONS,
    totalConversationsCount: 5,
    activeContacts: MOCK_ACTIVE_CONTACTS,
    handleSelectContact: jest.fn((c) => c.id),
    handleSelectConversation: jest.fn((c) => c.participant.id),
    isLoading: false,
    isRefreshing: false,
    onRefresh: jest.fn(),
    onLoadMore: jest.fn(),
    isLoadingMore: false,
    hasMore: false,
    isComposeOpen: false,
    handleOpenCompose: jest.fn(),
    handleCloseCompose: jest.fn(),
    recipientSearchQuery: "",
    setRecipientSearchQuery: jest.fn(),
    handleClearRecipientSearch: jest.fn(),
    filteredRecipients: MOCK_ACTIVE_CONTACTS,
    onLoadMoreRecipients: jest.fn(),
    isLoadingMoreRecipients: false,
    hasMoreRecipients: false,
  })),
}));
jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    useTheme: () => ({
      dark: false,
      colors: {
        primary: "#DE3A3A",
        surface: "#FFFFFF",
        surfaceVariant: "#F8F2F2",
        onSurface: "#111111",
        onSurfaceVariant: "#6F6262",
        outlineVariant: "#EFE1E1",
        background: "#FFFFFF",
        onBackground: "#111111",
      },
    }),
  };
});

import * as Haptics from "expo-haptics";
import {
  MessagesHeader,
  MessagesSearchBar,
  ActiveContactsTray,
  ConversationListItem,
  MessageAvatar,
  ConversationPreview,
  MessagesEmptyState,
  NewMessageBottomSheet,
} from "./index";
import MessagesScreen from "../../app/(app)/(tabs)/messages";

describe("components/Messages", () => {
  describe("MessagesHeader", () => {
    it("renders Messages title and compose button", () => {
      const onCompose = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <MessagesHeader onPressCompose={onCompose} />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Messages");

      const root = renderer!.root;
      const composeBtn = root.findByProps({
        accessibilityLabel: "New message",
      });
      expect(composeBtn).toBeDefined();

      act(() => {
        composeBtn.props.onPress();
      });
      expect(onCompose).toHaveBeenCalled();
    });
  });

  describe("MessagesSearchBar", () => {
    it("renders search placeholder and triggers onChangeText", () => {
      const onChange = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <MessagesSearchBar value="" onChangeText={onChange} />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Search messages");

      const root = renderer!.root;
      const input = root.findByProps({ accessibilityRole: "search" });
      act(() => {
        input.props.onChangeText("maya");
      });
      expect(onChange).toHaveBeenCalledWith("maya");
    });

    it("renders clear button when value is present and triggers clear", () => {
      const onClear = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <MessagesSearchBar
            value="searching"
            onChangeText={jest.fn()}
            onClear={onClear}
          />
        );
      });

      const root = renderer!.root;
      const clearBtn = root.findByProps({
        accessibilityLabel: "Clear search text",
      });
      act(() => {
        clearBtn.props.onPress();
      });
      expect(onClear).toHaveBeenCalled();
    });
  });

  describe("ActiveContactsTray", () => {
    it("renders horizontal list of contacts and handles selection", () => {
      const onSelect = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ActiveContactsTray
            contacts={MOCK_ACTIVE_CONTACTS}
            onSelectContact={onSelect}
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Maya");
      expect(json).toContain("MC");
      expect(json).toContain("Dev");
      expect(json).toContain("DP");

      const root = renderer!.root;
      const mayaButton = root.findByProps({
        accessibilityLabel: "Maya Chen, online",
      });
      act(() => {
        mayaButton.props.onPress();
      });
      expect(onSelect).toHaveBeenCalledWith(MOCK_ACTIVE_CONTACTS[0]);
    });
  });

  describe("ConversationListItem", () => {
    it("renders conversation row with unread badge and timestamp", () => {
      const onSelect = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ConversationListItem
            conversation={MOCK_CONVERSATIONS[0]} // Maya Chen, unread: 2
            onPress={onSelect}
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Maya Chen");
      expect(json).toContain("haha okay sending it now");
      expect(json).toContain("2m");
      expect(json).toContain("2"); // Unread count badge

      const root = renderer!.root;
      const row = root.findByProps({
        accessibilityLabel: "Chat with Maya Chen",
      });
      act(() => {
        row.props.onPress();
      });
      expect(onSelect).toHaveBeenCalledWith(MOCK_CONVERSATIONS[0]);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it("renders outgoing preview with you: prefix", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ConversationListItem
            conversation={MOCK_CONVERSATIONS[1]} // Studio North, outgoing
            onPress={jest.fn()}
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Studio North");
      expect(json).toContain("you: ");
      expect(json).toContain("love that direction");
    });

    it("renders reaction preview with emoji", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ConversationListItem
            conversation={MOCK_CONVERSATIONS[2]} // Dev Patel, reaction
            onPress={jest.fn()}
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Dev Patel");
      expect(json).toContain("reacted ❤️ to your message");
    });

    it("renders photo preview", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ConversationListItem
            conversation={MOCK_CONVERSATIONS[4]} // Riya Kapoor, photo
            onPress={jest.fn()}
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("Riya Kapoor");
      expect(json).toContain("Photo");
    });
  });

  describe("MessagesEmptyState", () => {
    it("renders empty state for inbox without search", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(<MessagesEmptyState />);
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("No messages yet");
    });

    it("renders search empty state with clear button", () => {
      const onReset = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <MessagesEmptyState
            searchQuery="nonexistent"
            onResetSearch={onReset}
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("No messages found");
      expect(json).toContain("nonexistent");

      const root = renderer!.root;
      const resetBtn = root.findByProps({ accessibilityLabel: "Clear search" });
      act(() => {
        resetBtn.props.onPress();
      });
      expect(onReset).toHaveBeenCalled();
    });
  });

  describe("MessageAvatar", () => {
    it("renders fallback initials and online indicator when isOnline is true", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <MessageAvatar
            initials="MC"
            avatarColor="#7CB342"
            isOnline={true}
            size={54}
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("MC");
      expect(json).toContain("#7CB342");
      expect(json).toContain("#10B981"); // Online badge color
    });

    it("renders image avatar when avatarUrl is provided", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <MessageAvatar
            initials="MC"
            avatarUrl="https://example.com/avatar.jpg"
            isOnline={false}
            size={58}
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("https://example.com/avatar.jpg");
      expect(json).not.toContain("#10B981");
    });
  });

  describe("ConversationPreview", () => {
    it("renders outgoing text preview with you: prefix", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ConversationPreview
            lastMessage={{ text: "hello", type: "outgoing", timestamp: "1m" }}
            unreadCount={0}
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("you: ");
      expect(json).toContain("hello");
    });

    it("renders reaction preview with emoji", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ConversationPreview
            lastMessage={{
              text: "reaction",
              type: "reaction",
              reactionEmoji: "🔥",
              timestamp: "1m",
            }}
            unreadCount={0}
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("reacted 🔥 to your message");
    });

    it("renders photo preview with camera icon", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ConversationPreview
            lastMessage={{ text: "Photo", type: "photo", timestamp: "1m" }}
            unreadCount={0}
          />
        );
      });

      const json = JSON.stringify(renderer!.toJSON());
      expect(json).toContain("camera-outline");
      expect(json).toContain("Photo");
    });
  });

  describe("NewMessageBottomSheet", () => {
    it("renders followed accounts and triggers onSelectRecipient when tapped", () => {
      const onSelect = jest.fn();
      const onClose = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <NewMessageBottomSheet
            visible={true}
            recipients={MOCK_ACTIVE_CONTACTS}
            searchQuery=""
            onChangeSearch={jest.fn()}
            onClearSearch={jest.fn()}
            onSelectRecipient={onSelect}
            onClose={onClose}
            onLoadMore={jest.fn()}
            isLoadingMore={false}
            hasMore={false}
          />
        );
      });

      const root = renderer!.root;
      const closeBtn = root.findByProps({
        accessibilityLabel: "Close new message",
      });
      expect(closeBtn).toBeDefined();

      const mayaRow = root.findByProps({
        accessibilityLabel: "Message Maya Chen",
      });
      expect(mayaRow).toBeDefined();

      act(() => {
        mayaRow.props.onPress();
      });
      expect(onSelect).toHaveBeenCalledWith(MOCK_ACTIVE_CONTACTS[0]);
    });

    it("renders empty state when no recipients match search", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <NewMessageBottomSheet
            visible={true}
            recipients={[]}
            searchQuery="unknown"
            onChangeSearch={jest.fn()}
            onClearSearch={jest.fn()}
            onSelectRecipient={jest.fn()}
            onClose={jest.fn()}
            onLoadMore={jest.fn()}
            isLoadingMore={false}
            hasMore={false}
          />
        );
      });

      const root = renderer!.root;
      const emptyIcon = root.findAllByProps({ name: "search-outline" });
      expect(emptyIcon.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("MessagesScreen", () => {
    it("renders full messages screen using InfiniteScrollList", () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(<MessagesScreen />);
      });

      const root = renderer!.root;
      const composeBtn = root.findByProps({ accessibilityLabel: "New message" });
      expect(composeBtn).toBeDefined();

      const searchInput = root.findByProps({ accessibilityRole: "search" });
      expect(searchInput).toBeDefined();

      const list = root.findByProps({ showsVerticalScrollIndicator: false });
      expect(list).toBeDefined();
    });
  });
});

