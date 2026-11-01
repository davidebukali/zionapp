import { normalizeDiscoverAccount, updateUserInCaches } from "./utils";
import { BackendUser } from "./types";
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
});

