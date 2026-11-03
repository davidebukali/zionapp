import {
  filterConversations,
  findOrCreateConversation,
  formatMessageTimestamp,
} from "./utils";
import { MOCK_CONVERSATIONS, MOCK_ACTIVE_CONTACTS } from "./mockData";
import { OnlineContact } from "./types";

describe("features/messages/utils", () => {
  describe("filterConversations", () => {
    it("returns all conversations when search query is empty", () => {
      const result = filterConversations(MOCK_CONVERSATIONS, "");
      expect(result).toHaveLength(MOCK_CONVERSATIONS.length);
    });

    it("filters conversations by participant name case-insensitively", () => {
      const result = filterConversations(MOCK_CONVERSATIONS, "maya");
      expect(result).toHaveLength(1);
      expect(result[0].participant.name).toBe("Maya Chen");
    });

    it("filters conversations by message text", () => {
      const result = filterConversations(MOCK_CONVERSATIONS, "direction");
      expect(result).toHaveLength(1);
      expect(result[0].participant.name).toBe("Studio North");
    });

    it("returns empty array when query does not match anything", () => {
      const result = filterConversations(MOCK_CONVERSATIONS, "nonexistent-query-xyz");
      expect(result).toHaveLength(0);
    });
  });

  describe("findOrCreateConversation", () => {
    it("returns existing conversation ID if participant already has a thread", () => {
      const existingContact = MOCK_ACTIVE_CONTACTS[0]; // Maya Chen
      const { updatedConversations, selectedConversationId } =
        findOrCreateConversation(MOCK_CONVERSATIONS, existingContact);

      expect(selectedConversationId).toBe("conv-1");
      expect(updatedConversations).toHaveLength(MOCK_CONVERSATIONS.length);
    });

    it("prepends a new conversation thread when contact is not in list", () => {
      const newContact: OnlineContact = {
        id: "user-new-sarah",
        name: "Sarah Connor",
        username: "sarahc",
        initials: "SC",
        isOnline: true,
      };

      const { updatedConversations, selectedConversationId } =
        findOrCreateConversation(MOCK_CONVERSATIONS, newContact);

      expect(updatedConversations).toHaveLength(MOCK_CONVERSATIONS.length + 1);
      expect(updatedConversations[0].id).toBe(selectedConversationId);
      expect(updatedConversations[0].participant.name).toBe("Sarah Connor");
    });
  });

  describe("formatMessageTimestamp", () => {
    it("preserves already-compact relative times", () => {
      expect(formatMessageTimestamp("2m")).toBe("2m");
      expect(formatMessageTimestamp("1h")).toBe("1h");
      expect(formatMessageTimestamp("Just now")).toBe("Just now");
    });

    it("formats ISO string into relative time without ago suffix", () => {
      const iso = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const formatted = formatMessageTimestamp(iso);
      expect(formatted).not.toContain("ago");
    });
  });
});

