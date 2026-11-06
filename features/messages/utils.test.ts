import {
  applyReactionEventToMessage,
  filterConversations,
  filterRecipients,
  formatConversationPreviewText,
  formatMessageTimestamp,
  getAvatarColor,
  getInitials,
  insertMessageInCache,
  markConversationReadInCache,
  mergeConversationsCache,
  mergeMessagesCache,
  mergeRecipientsCache,
  normalizeConversation,
  normalizeMessage,
  normalizeRecipient,
  POST_SHARE_PREVIEW_TEXT,
  updateMessageInCache,
} from "./utils";
import {
  BackendConversation,
  BackendMessage,
  BackendRecipient,
  ChatMessage,
  Conversation,
  ConversationsResult,
  MessagesResult,
  OnlineContact,
  RecipientsResult,
} from "./types";

const TEST_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    participant: {
      id: "user-maya",
      name: "Maya Chen",
      username: "mayachen",
      initials: "MC",
      isOnline: true,
      avatarColor: "#7CB342",
    },
    lastMessage: {
      text: "haha okay sending it now",
      type: "text",
      timestamp: "2m",
    },
    unreadCount: 2,
  },
  {
    id: "conv-2",
    participant: {
      id: "user-studio",
      name: "Studio North",
      username: "studionorth",
      initials: "SN",
      isOnline: false,
      avatarColor: "#E64A19",
    },
    lastMessage: {
      text: "love that direction",
      type: "outgoing",
      timestamp: "1h",
    },
    unreadCount: 0,
  },
];

describe("features/messages/utils", () => {
  describe("getInitials & getAvatarColor", () => {
    it("extracts initials correctly", () => {
      expect(getInitials("Maya Chen")).toBe("MC");
      expect(getInitials("Single")).toBe("SI");
      expect(getInitials("")).toBe("??");
      expect(getInitials(undefined)).toBe("??");
    });

    it("generates deterministic avatar color", () => {
      const color1 = getAvatarColor("user-1");
      const color2 = getAvatarColor("user-1");
      expect(color1).toBe(color2);
      expect(typeof color1).toBe("string");
    });
  });

  describe("normalizeRecipient", () => {
    it("transforms backend recipient into OnlineContact", () => {
      const raw: BackendRecipient = {
        id: "01JBD1USER0000000000000002",
        name: "Jane Doe",
        username: "janedoe",
        avatar: {
          id: "avatar-1",
          url: "https://example.com/avatar.jpg",
        },
      };

      const result = normalizeRecipient(raw);
      expect(result.id).toBe("01JBD1USER0000000000000002");
      expect(result.name).toBe("Jane Doe");
      expect(result.username).toBe("janedoe");
      expect(result.avatarUrl).toBe("https://example.com/avatar.jpg");
      expect(result.initials).toBe("JD");
      expect(result.isOnline).toBe(false);
      expect(result.avatarColor).toBeDefined();
    });
  });

  describe("normalizeConversation", () => {
    it("transforms backend conversation with incoming message", () => {
      const raw: BackendConversation = {
        id: "conv-1",
        unread_count: 3,
        is_archived: false,
        is_muted: false,
        can_send_messages: true,
        has_blocked_participant: false,
        recipient: {
          id: "user-2",
          name: "Jane Doe",
          username: "janedoe",
        },
        last_message: {
          id: "msg-1",
          sender_id: "user-2",
          body: "Hello!",
          created_at: new Date().toISOString(),
        },
      };

      const result = normalizeConversation(raw, "user-1");
      expect(result.id).toBe("conv-1");
      expect(result.unreadCount).toBe(3);
      expect(result.lastMessage.text).toBe("Hello!");
      expect(result.lastMessage.type).toBe("text");
      expect(result.canSendMessages).toBe(true);
      expect(result.hasBlockedParticipant).toBe(false);
    });

    it("flags outgoing last message when sender matches currentUserId", () => {
      const raw: BackendConversation = {
        id: "conv-2",
        unread_count: 0,
        is_archived: false,
        is_muted: false,
        recipient: { id: "user-2", name: "Jane", username: "jane" },
        last_message: {
          id: "msg-2",
          sender_id: "user-1",
          body: "Outgoing text",
          created_at: new Date().toISOString(),
        },
      };

      const result = normalizeConversation(raw, "user-1");
      expect(result.lastMessage.type).toBe("outgoing");
      expect(result.lastMessage.text).toBe("Outgoing text");
    });

    it("redacts deleted message", () => {
      const raw: BackendConversation = {
        id: "conv-3",
        unread_count: 0,
        is_archived: false,
        is_muted: false,
        recipient: { id: "user-2", name: "Jane", username: "jane" },
        last_message: {
          id: "msg-3",
          sender_id: "user-2",
          body: null,
          is_deleted_for_everyone: true,
          created_at: new Date().toISOString(),
        },
      };

      const result = normalizeConversation(raw, "user-1");
      expect(result.lastMessage.text).toBe("This message was deleted");
    });

    it("formats incoming post share preview cleanly as 'shared a post'", () => {
      const raw: BackendConversation = {
        id: "conv-post-incoming",
        unread_count: 1,
        is_archived: false,
        is_muted: false,
        recipient: { id: "user-2", name: "Jane", username: "jane" },
        last_message: {
          id: "msg-post-1",
          sender_id: "user-2",
          body: "[zion:post:post-999]",
          created_at: new Date().toISOString(),
        },
      };

      const result = normalizeConversation(raw, "user-1");
      expect(result.lastMessage.text).toBe("shared a post");
      expect(result.lastMessage.type).toBe("text");
    });

    it("formats outgoing post share preview cleanly as 'shared a post' with outgoing type", () => {
      const raw: BackendConversation = {
        id: "conv-post-outgoing",
        unread_count: 0,
        is_archived: false,
        is_muted: false,
        recipient: { id: "user-2", name: "Jane", username: "jane" },
        last_message: {
          id: "msg-post-2",
          sender_id: "user-1",
          body: "zion:post:post-888",
          created_at: new Date().toISOString(),
        },
      };

      const result = normalizeConversation(raw, "user-1");
      expect(result.lastMessage.text).toBe("shared a post");
      expect(result.lastMessage.type).toBe("outgoing");
    });
  });

  describe("formatConversationPreviewText", () => {
    it("converts bracketed post share tag to 'shared a post'", () => {
      expect(formatConversationPreviewText("[zion:post:post-123]")).toBe(
        POST_SHARE_PREVIEW_TEXT
      );
    });

    it("converts unbracketed post share tag to 'shared a post'", () => {
      expect(formatConversationPreviewText("zion:post:post-123")).toBe(
        POST_SHARE_PREVIEW_TEXT
      );
    });

    it("converts post share tag with companion text to 'shared a post'", () => {
      expect(
        formatConversationPreviewText("[zion:post:post-123] Look at this!")
      ).toBe(POST_SHARE_PREVIEW_TEXT);
    });

    it("leaves standard text messages unchanged", () => {
      expect(formatConversationPreviewText("Hey, what are you up to?")).toBe(
        "Hey, what are you up to?"
      );
    });
  });

  describe("normalizeMessage", () => {
    it("transforms backend message into ChatMessage", () => {
      const raw: BackendMessage = {
        id: "msg-1",
        conversation_id: "conv-1",
        sender_id: "user-2",
        sender: { id: "user-2", name: "Jane", username: "jane" },
        body: "Hey there",
        media: [],
        reply_to: null,
        reactions: [{ emoji: "🔥", count: 1, user_reacted: true }],
        is_edited: false,
        is_deleted_for_everyone: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = normalizeMessage(raw, "user-1");
      expect(result.id).toBe("msg-1");
      expect(result.isOutgoing).toBe(false);
      expect(result.text).toBe("Hey there");
      expect(result.reactions).toEqual(["🔥"]);
      expect(result.isDeletedForEveryone).toBe(false);
    });

    it("identifies outgoing message and handles deleted text", () => {
      const raw: BackendMessage = {
        id: "msg-2",
        conversation_id: "conv-1",
        sender_id: "user-1",
        sender: { id: "user-1", name: "Me", username: "me" },
        body: null,
        media: [],
        reply_to: null,
        reactions: [],
        is_edited: false,
        is_deleted_for_everyone: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = normalizeMessage(raw, "user-1");
      expect(result.isOutgoing).toBe(true);
      expect(result.text).toBe("This message was deleted");
      expect(result.isDeletedForEveryone).toBe(true);
    });

    it("extracts sharedPostId and separates companion text", () => {
      const raw: BackendMessage = {
        id: "msg-post-1",
        conversation_id: "conv-1",
        sender_id: "user-2",
        sender: { id: "user-2", name: "Maya", username: "maya" },
        body: "[zion:post:post-xyz-123] Check this amazing post!",
        media: [],
        reply_to: null,
        reactions: [],
        is_edited: false,
        is_deleted_for_everyone: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = normalizeMessage(raw, "user-1");
      expect(result.sharedPostId).toBe("post-xyz-123");
      expect(result.text).toBe("Check this amazing post!");
    });

    it("extracts sharedPostId with no companion text", () => {
      const raw: BackendMessage = {
        id: "msg-post-2",
        conversation_id: "conv-1",
        sender_id: "user-1",
        sender: { id: "user-1", name: "Me", username: "me" },
        body: "[zion:post:post-solo-456]",
        media: [],
        reply_to: null,
        reactions: [],
        is_edited: false,
        is_deleted_for_everyone: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = normalizeMessage(raw, "user-1");
      expect(result.sharedPostId).toBe("post-solo-456");
      expect(result.text).toBeUndefined();
    });
  });

  describe("filterConversations", () => {
    it("returns all conversations when search query is empty", () => {
      const result = filterConversations(TEST_CONVERSATIONS, "");
      expect(result).toHaveLength(TEST_CONVERSATIONS.length);
    });

    it("filters conversations by participant name case-insensitively", () => {
      const result = filterConversations(TEST_CONVERSATIONS, "maya");
      expect(result).toHaveLength(1);
      expect(result[0].participant.name).toBe("Maya Chen");
    });

    it("filters conversations by message text", () => {
      const result = filterConversations(TEST_CONVERSATIONS, "direction");
      expect(result).toHaveLength(1);
      expect(result[0].participant.name).toBe("Studio North");
    });

    it("returns empty array when query does not match anything", () => {
      const result = filterConversations(
        TEST_CONVERSATIONS,
        "nonexistent-query-xyz"
      );
      expect(result).toHaveLength(0);
    });
  });

  describe("filterRecipients & mergeRecipientsCache", () => {
    const testRecipients: OnlineContact[] = [
      TEST_CONVERSATIONS[0].participant,
      TEST_CONVERSATIONS[1].participant,
    ];

    it("returns all recipients when query is empty", () => {
      expect(filterRecipients(testRecipients, "")).toHaveLength(2);
    });

    it("filters recipients by name or @username", () => {
      expect(filterRecipients(testRecipients, "Maya")).toHaveLength(1);
      expect(filterRecipients(testRecipients, "@studionorth")).toHaveLength(1);
      expect(filterRecipients(testRecipients, "nobody")).toHaveLength(0);
    });

    it("merges and deduplicates recipients cache across cursors", () => {
      const current: RecipientsResult = {
        recipients: [testRecipients[0]],
        nextCursor: "rc-1",
      };
      const incoming: RecipientsResult = {
        recipients: [testRecipients[0], testRecipients[1]],
        nextCursor: null,
      };

      mergeRecipientsCache(current, incoming, "rc-1");
      expect(current.recipients).toHaveLength(2);
      expect(current.nextCursor).toBeNull();
    });
  });

  describe("formatMessageTimestamp", () => {
    it("preserves already-compact relative times", () => {
      expect(formatMessageTimestamp("2m")).toBe("2m");
      expect(formatMessageTimestamp("1h")).toBe("1h");
      expect(formatMessageTimestamp("Just now")).toBe("Just now");
      expect(formatMessageTimestamp("9:14")).toBe("9:14");
    });

    it("formats ISO string into relative time without ago suffix", () => {
      const iso = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const formatted = formatMessageTimestamp(iso);
      expect(formatted).not.toContain("ago");
    });
  });

  describe("mergeConversationsCache & mergeMessagesCache", () => {
    it("replaces cache on initial load (no cursor)", () => {
      const current: ConversationsResult = { conversations: [], nextCursor: null };
      const next: ConversationsResult = {
        conversations: [TEST_CONVERSATIONS[0]],
        nextCursor: "cursor-2",
      };

      mergeConversationsCache(current, next, null);
      expect(current.conversations).toHaveLength(1);
      expect(current.nextCursor).toBe("cursor-2");
    });

    it("deduplicates conversations when appending next page", () => {
      const current: ConversationsResult = {
        conversations: [TEST_CONVERSATIONS[0]],
        nextCursor: "cursor-2",
      };
      const next: ConversationsResult = {
        conversations: [TEST_CONVERSATIONS[0], TEST_CONVERSATIONS[1]],
        nextCursor: "cursor-3",
      };

      mergeConversationsCache(current, next, "cursor-2");
      expect(current.conversations).toHaveLength(2);
      expect(current.nextCursor).toBe("cursor-3");
    });

    it("merges messages cache and appends older messages in reverse-chronological order", () => {
      const msgOlder: ChatMessage = {
        id: "m-1",
        senderId: "u-1",
        isOutgoing: false,
        text: "older",
        timestamp: "9:00",
      };
      const msgNewer: ChatMessage = {
        id: "m-2",
        senderId: "u-1",
        isOutgoing: false,
        text: "newer",
        timestamp: "9:01",
      };

      const current: MessagesResult = { messages: [msgNewer], nextCursor: "c-1" };
      const next: MessagesResult = { messages: [msgOlder], nextCursor: "c-2" };

      mergeMessagesCache(current, next, "c-1");
      expect(current.messages).toHaveLength(2);
      expect(current.messages[0].id).toBe("m-2");
      expect(current.messages[1].id).toBe("m-1");
    });
  });

  describe("applyReactionEventToMessage", () => {
    it("adds reaction from other user", () => {
      const msg: ChatMessage = {
        id: "m-1",
        senderId: "u-1",
        isOutgoing: false,
        timestamp: "9:00",
        rawReactions: [],
      };

      const updated = applyReactionEventToMessage(
        msg,
        {
          message_id: "m-1",
          conversation_id: "c-1",
          user_id: "u-2",
          emoji: "🔥",
        },
        "u-1"
      );

      expect(updated.reactions).toEqual(["🔥"]);
      expect(updated.rawReactions?.[0].count).toBe(1);
      expect(updated.rawReactions?.[0].user_reacted).toBe(false);
    });

    it("increments reaction count and sets user_reacted when current user reacts", () => {
      const msg: ChatMessage = {
        id: "m-1",
        senderId: "u-1",
        isOutgoing: false,
        timestamp: "9:00",
        rawReactions: [{ emoji: "❤️", count: 1, user_reacted: false }],
        reactions: ["❤️"],
      };

      const updated = applyReactionEventToMessage(
        msg,
        {
          message_id: "m-1",
          conversation_id: "c-1",
          user_id: "me",
          emoji: "❤️",
        },
        "me"
      );

      expect(updated.rawReactions?.[0].count).toBe(2);
      expect(updated.rawReactions?.[0].user_reacted).toBe(true);
    });

    it("removes reaction when emoji is null", () => {
      const msg: ChatMessage = {
        id: "m-1",
        senderId: "u-1",
        isOutgoing: false,
        timestamp: "9:00",
        rawReactions: [{ emoji: "❤️", count: 1, user_reacted: true }],
        reactions: ["❤️"],
      };

      const updated = applyReactionEventToMessage(
        msg,
        {
          message_id: "m-1",
          conversation_id: "c-1",
          user_id: "me",
          emoji: null,
        },
        "me"
      );

      expect(updated.reactions).toBeUndefined();
      expect(updated.rawReactions).toEqual([]);
    });
  });

  describe("Dependency-Injected Cache Updaters", () => {
    it("insertMessageInCache unshifts new message to front of cache and dispatches updateQueryData", () => {
      const fakeUndo = jest.fn();
      const dispatch = jest.fn().mockReturnValue({ undo: fakeUndo });
      const api = {
        util: {
          updateQueryData: jest.fn().mockImplementation((endpoint, arg, updater) => {
            if (endpoint === "getMessages") {
              const existingMsg: ChatMessage = {
                id: "m-existing",
                senderId: "u-1",
                isOutgoing: false,
                text: "existing",
                timestamp: "9:00",
              };
              const draft = { messages: [existingMsg] as ChatMessage[] };
              updater(draft);
              expect(draft.messages[0].id).toBe("m-new");
              expect(draft.messages[1].id).toBe("m-existing");
            } else if (endpoint === "getConversations") {
              const draft = { conversations: [] as any[] };
              updater(draft);
            }
            return { type: "patch" };
          }),
        },
      };

      const newMsg: ChatMessage = {
        id: "m-new",
        senderId: "u-1",
        isOutgoing: true,
        text: "hello",
        timestamp: "9:30",
      };

      const undo = insertMessageInCache(api, dispatch, "c-1", newMsg);
      expect(dispatch).toHaveBeenCalledTimes(2);
      undo();
      expect(fakeUndo).toHaveBeenCalledTimes(2);
    });

    it("insertMessageInCache updates conversation lastMessage to 'shared a post' when message has sharedPostId", () => {
      const fakeUndo = jest.fn();
      const dispatch = jest.fn().mockReturnValue({ undo: fakeUndo });
      let conversationDraft: any;

      const api = {
        util: {
          updateQueryData: jest.fn().mockImplementation((endpoint, arg, updater) => {
            if (endpoint === "getConversations") {
              conversationDraft = {
                conversations: [
                  {
                    id: "c-1",
                    unreadCount: 0,
                    lastMessage: { text: "old", type: "text", timestamp: "1m" },
                  },
                ],
              };
              updater(conversationDraft);
            }
            return { type: "patch" };
          }),
        },
      };

      const postShareMsg: ChatMessage = {
        id: "m-post-share",
        senderId: "u-1",
        isOutgoing: true,
        sharedPostId: "post-123",
        timestamp: "Just now",
      };

      insertMessageInCache(api, dispatch, "c-1", postShareMsg);
      expect(conversationDraft.conversations[0].lastMessage.text).toBe(
        POST_SHARE_PREVIEW_TEXT
      );
      expect(conversationDraft.conversations[0].lastMessage.type).toBe(
        "outgoing"
      );
    });

    it("updateMessageInCache updates message in draft", () => {
      const fakeUndo = jest.fn();
      const dispatch = jest.fn().mockReturnValue({ undo: fakeUndo });
      const api = {
        util: {
          updateQueryData: jest.fn().mockImplementation((endpoint, arg, updater) => {
            const draft = {
              messages: [{ id: "m-1", text: "old text" } as ChatMessage],
            };
            updater(draft);
            expect(draft.messages[0].text).toBe("new text");
            return { type: "patch" };
          }),
        },
      };

      const undo = updateMessageInCache(api, dispatch, "c-1", "m-1", (msg) => {
        msg.text = "new text";
      });
      expect(dispatch).toHaveBeenCalledTimes(1);
      undo();
      expect(fakeUndo).toHaveBeenCalledTimes(1);
    });

    it("markConversationReadInCache sets unreadCount to 0", () => {
      const fakeUndo = jest.fn();
      const dispatch = jest.fn().mockReturnValue({ undo: fakeUndo });
      const api = {
        util: {
          updateQueryData: jest.fn().mockImplementation((endpoint, arg, updater) => {
            const draft = {
              conversations: [{ id: "c-1", unreadCount: 5 }],
            };
            updater(draft);
            expect(draft.conversations[0].unreadCount).toBe(0);
            return { type: "patch" };
          }),
        },
      };

      const undo = markConversationReadInCache(api, dispatch, "c-1");
      expect(dispatch).toHaveBeenCalledTimes(1);
      undo();
      expect(fakeUndo).toHaveBeenCalledTimes(1);
    });
  });
});
