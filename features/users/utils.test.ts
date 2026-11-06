import {
  mergeTaggableUsersCache,
  normalizeDiscoverAccount,
  normalizeTaggableUser,
  normalizeUserProfile,
  replaceMentionAtCursor,
  shouldTriggerMentionSheet,
  syncTaggedUserIds,
  updateProfileFollowInCaches,
  updateUserInCaches,
} from "./utils";
import { BackendProfile, BackendTaggableUser, BackendUser, TaggableUsersResult } from "./types";
import { DiscoverAccount } from "../../components/Discover/types";

describe("features/users/utils", () => {
  describe("normalizeDiscoverAccount", () => {
    it("normalizes a full user profile into DiscoverAccount", () => {
      const raw: BackendUser = {
        id: "01j7b9k5v6abcdef0123456789",
        name: "Sarah Connor",
        email: "sarah@example.com",
        is_following: true,
        profile: {
          id: "prof-1",
          username: "sarah_c",
          display_name: "Sarah C.",
          bio: "Building with Flutter & Laravel",
          is_following: true,
          avatar: {
            id: "m-1",
            url: "https://example.com/sarah.jpg",
          },
          website: "https://sarah.io",
        },
      };

      const normalized = normalizeDiscoverAccount(raw);

      expect(normalized.id).toBe("01j7b9k5v6abcdef0123456789");
      expect(normalized.name).toBe("Sarah C.");
      expect(normalized.username).toBe("sarah_c");
      expect(normalized.avatarUrl).toBe("https://example.com/sarah.jpg");
      expect(normalized.initials).toBe("SC");
      expect(normalized.isFollowing).toBe(true);
      expect(normalized.bio).toBe("Building with Flutter & Laravel");
      expect(normalized.meta).toBe("https://sarah.io");
    });

    it("handles missing profile and falls back gracefully", () => {
      const raw: BackendUser = {
        id: "01j7b9k5v6abcdef9999999999",
        name: "John Doe",
        email: "john@example.com",
        is_following: false,
        profile: null,
      };

      const normalized = normalizeDiscoverAccount(raw);

      expect(normalized.id).toBe("01j7b9k5v6abcdef9999999999");
      expect(normalized.name).toBe("John Doe");
      expect(normalized.username).toBe("johndoe");
      expect(normalized.avatarUrl).toBeUndefined();
      expect(normalized.initials).toBe("JD");
      expect(normalized.isFollowing).toBe(false);
      expect(normalized.bio).toBe("");
      expect(normalized.meta).toBe("Member");
    });
  });

  describe("updateUserInCaches", () => {
    it("applies updater to drafts and reverts on undo", () => {
      let draftData: DiscoverAccount[] = [
        {
          id: "u-1",
          name: "User 1",
          username: "user1",
          isFollowing: false,
          meta: "Member",
          bio: "",
        },
      ];

      const undoMock = jest.fn(() => {
        draftData[0].isFollowing = false;
      });

      const mockDispatch = jest.fn((action: any) => {
        if (typeof action === "function") {
          action();
        }
        return { undo: undoMock };
      });

      const mockApi = {
        util: {
          updateQueryData: jest.fn(
            (endpointName: string, args: any, recipe: (draft: any) => void) => {
              return () => {
                recipe(draftData);
              };
            }
          ),
        },
      };

      const undo = updateUserInCaches(
        mockApi,
        mockDispatch,
        "u-1",
        (acc) => {
          acc.isFollowing = true;
        },
        { q: "user" }
      );

      // Verify dispatch was called
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockApi.util.updateQueryData).toHaveBeenCalledWith(
        "searchUsers",
        { q: "user" },
        expect.any(Function)
      );

      // Trigger undo
      undo();
      expect(undoMock).toHaveBeenCalled();
    });
  });

  describe("normalizeUserProfile", () => {
    it("normalizes backend profile and counts into UserProfileData", () => {
      const profile: BackendProfile = {
        id: "prof-10",
        user_id: "user-10",
        username: "peterokwi",
        display_name: "Peter Okwi",
        bio: "Bio goes here",
        website: "https://example.com",
        location: "Kampala",
        created_at: "2026-01-01T00:00:00Z",
        avatar: {
          id: "med-1",
          url: "https://example.com/avatar.jpg",
        },
        is_following: true,
      };

      const normalized = normalizeUserProfile(profile, null, {
        followers: 342,
        following: 128,
      });

      expect(normalized.id).toBe("prof-10");
      expect(normalized.userId).toBe("user-10");
      expect(normalized.displayName).toBe("Peter Okwi");
      expect(normalized.username).toBe("peterokwi");
      expect(normalized.bio).toBe("Bio goes here");
      expect(normalized.website).toBe("https://example.com");
      expect(normalized.location).toBe("Kampala");
      expect(normalized.avatarUrl).toBe("https://example.com/avatar.jpg");
      expect(normalized.isFollowing).toBe(true);
      expect(normalized.followersCount).toBe(342);
      expect(normalized.followingCount).toBe(128);
    });

    it("falls back to user object when profile is null", () => {
      const user: BackendUser = {
        id: "user-20",
        name: "Jane Doe",
        email: "jane@example.com",
        is_following: false,
      };

      const normalized = normalizeUserProfile(null, user);

      expect(normalized.id).toBe("user-20");
      expect(normalized.userId).toBe("user-20");
      expect(normalized.displayName).toBe("Jane Doe");
      expect(normalized.username).toBe("janedoe");
      expect(normalized.followersCount).toBe(0);
      expect(normalized.followingCount).toBe(0);
      expect(normalized.isFollowing).toBe(false);
    });
  });

  describe("updateProfileFollowInCaches", () => {
    it("dispatches cache updates for profile and followers count", () => {
      const undoMock = jest.fn();
      const mockDispatch = jest.fn(() => ({ undo: undoMock }));
      const mockApi = {
        util: {
          updateQueryData: jest.fn(),
        },
      };

      const undo = updateProfileFollowInCaches(
        mockApi,
        mockDispatch,
        "user-10",
        true
      );

      expect(mockDispatch).toHaveBeenCalledTimes(2);
      expect(mockApi.util.updateQueryData).toHaveBeenCalledWith(
        "getUserProfile",
        "user-10",
        expect.any(Function)
      );
      expect(mockApi.util.updateQueryData).toHaveBeenCalledWith(
        "getUserFollowersCount",
        "user-10",
        expect.any(Function)
      );

      undo();
      expect(undoMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("normalizeTaggableUser", () => {
    it("normalizes a full BackendTaggableUser with profile", () => {
      const raw: BackendTaggableUser = {
        id: "01J00000000000000000000001",
        name: "Jane Doe",
        email: "jane@example.com",
        is_following: true,
        profile: {
          id: "01J00000000000000000000002",
          user_id: "01J00000000000000000000001",
          username: "janedoe",
          display_name: "Jane | Designer",
          bio: "Product designer and thinker.",
          account_type: "personal",
          avatar: {
            id: "01J00000000000000000000003",
            url: "https://cdn.example.com/avatars/jane.jpg",
          },
        },
      };

      const result = normalizeTaggableUser(raw);

      expect(result.id).toBe("01J00000000000000000000001");
      expect(result.name).toBe("Jane | Designer");
      expect(result.username).toBe("janedoe");
      expect(result.avatarUrl).toBe("https://cdn.example.com/avatars/jane.jpg");
      expect(result.initials).toBe("J|");
      expect(result.isFollowing).toBe(true);
    });

    it("falls back gracefully when profile is missing", () => {
      const raw: BackendTaggableUser = {
        id: "01J00000000000000000000002",
        name: "Mark Stone",
        email: "mark@example.com",
        is_following: false,
        profile: null,
      };

      const result = normalizeTaggableUser(raw);

      expect(result.id).toBe("01J00000000000000000000002");
      expect(result.name).toBe("Mark Stone");
      expect(result.username).toBe("markstone");
      expect(result.avatarUrl).toBeNull();
      expect(result.initials).toBe("MS");
      expect(result.isFollowing).toBe(false);
    });
  });

  describe("mergeTaggableUsersCache", () => {
    it("replaces cache when no cursor is provided", () => {
      const currentCache: TaggableUsersResult = {
        users: [
          { id: "1", name: "User 1", username: "u1", initials: "U1", avatarUrl: null },
        ],
        nextCursor: "cursor-1",
      };

      const incoming: TaggableUsersResult = {
        users: [
          { id: "2", name: "User 2", username: "u2", initials: "U2", avatarUrl: null },
        ],
        nextCursor: "cursor-2",
      };

      mergeTaggableUsersCache(currentCache, incoming, null);

      expect(currentCache.users).toHaveLength(1);
      expect(currentCache.users[0].id).toBe("2");
      expect(currentCache.nextCursor).toBe("cursor-2");
    });

    it("appends unique items when cursor is present", () => {
      const currentCache: TaggableUsersResult = {
        users: [
          { id: "1", name: "User 1", username: "u1", initials: "U1", avatarUrl: null },
        ],
        nextCursor: "cursor-1",
      };

      const incoming: TaggableUsersResult = {
        users: [
          { id: "1", name: "User 1", username: "u1", initials: "U1", avatarUrl: null },
          { id: "2", name: "User 2", username: "u2", initials: "U2", avatarUrl: null },
        ],
        nextCursor: "cursor-2",
      };

      mergeTaggableUsersCache(currentCache, incoming, "cursor-1");

      expect(currentCache.users).toHaveLength(2);
      expect(currentCache.users[0].id).toBe("1");
      expect(currentCache.users[1].id).toBe("2");
      expect(currentCache.nextCursor).toBe("cursor-2");
    });
  });

  describe("syncTaggedUserIds", () => {
    it("extracts matching active user IDs and removes unmentioned ones", () => {
      const map = new Map<string, string>();
      map.set("alice", "id-alice");
      map.set("bob", "id-bob");
      map.set("carol", "id-carol");

      const content = "Hello @alice and @bob!";
      const activeIds = syncTaggedUserIds(content, map);

      expect(activeIds).toEqual(["id-alice", "id-bob"]);
      expect(activeIds).not.toContain("id-carol");
    });

    it("caps at a maximum of 20 IDs", () => {
      const map = new Map<string, string>();
      let content = "";
      for (let i = 1; i <= 25; i++) {
        map.set(`user${i}`, `id-${i}`);
        content += `@user${i} `;
      }

      const activeIds = syncTaggedUserIds(content, map);
      expect(activeIds).toHaveLength(20);
    });

    it("returns empty array for empty content or empty map", () => {
      expect(syncTaggedUserIds("", new Map())).toEqual([]);
    });
  });

  describe("replaceMentionAtCursor", () => {
    it("replaces typed @ at cursor without double @", () => {
      const text = "Hello @";
      const result = replaceMentionAtCursor(text, 7, "janedoe", true);

      expect(result.newText).toBe("Hello @janedoe ");
      expect(result.newCursorPosition).toBe(15);
    });

    it("inserts @username at cursor when opened via toolbar", () => {
      const text = "Hello world";
      const result = replaceMentionAtCursor(text, 5, "janedoe", false);

      expect(result.newText).toBe("Hello@janedoe  world");
      expect(result.newCursorPosition).toBe(14);
    });
  });

  describe("shouldTriggerMentionSheet", () => {
    it("triggers on start-of-line @", () => {
      expect(shouldTriggerMentionSheet("@")).toBe(true);
    });

    it("triggers on whitespace followed by @", () => {
      expect(shouldTriggerMentionSheet("Hello @")).toBe(true);
      expect(shouldTriggerMentionSheet("Line 1\n@")).toBe(true);
    });

    it("does NOT trigger for email addresses or mid-word @", () => {
      expect(shouldTriggerMentionSheet("john@")).toBe(false);
      expect(shouldTriggerMentionSheet("contact@example.com")).toBe(false);
    });
  });
});

