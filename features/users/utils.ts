import { DiscoverAccount } from "../../components/Discover/types";
import { getUserAvatarUrl, getUserInitials } from "../../utils/user";
import { BackendUser } from "./types";

/**
 * Normalizes a raw BackendUser from the API into a DiscoverAccount model.
 */
export function normalizeDiscoverAccount(raw: BackendUser): DiscoverAccount {
  const displayName =
    raw.profile?.display_name?.trim() || raw.name?.trim() || "Member";
  const username =
    raw.profile?.username?.trim() ||
    raw.name?.toLowerCase().replace(/\s+/g, "") ||
    "user";
  const avatarUrl = getUserAvatarUrl(raw);
  const initials = getUserInitials(displayName, raw.email);
  const isFollowing = Boolean(
    raw.is_following ?? raw.profile?.is_following ?? false
  );
  const bio = raw.profile?.bio?.trim() || "";

  // Social proof or meta snippet (e.g. website or fallback description)
  const meta = raw.profile?.website?.trim() || "Member";

  return {
    id: String(raw.id),
    name: displayName,
    username,
    avatarUrl,
    initials,
    meta,
    bio,
    isFollowing,
  };
}

/**
 * Optimistically updates user follow status across active RTK Query caches.
 * Uses Dependency Injection for the api slice to avoid circular dependencies.
 *
 * Returns an undo function that reverts patched caches if the API call fails.
 */
export function updateUserInCaches(
  api: any,
  dispatch: any,
  userId: string,
  updater: (account: DiscoverAccount) => void,
  searchArgs?: { q: string }
): () => void {
  const patches: Array<{ undo: () => void }> = [];

  // If specific searchArgs provided, patch it directly
  if (searchArgs) {
    const patch = dispatch(
      api.util.updateQueryData("searchUsers", searchArgs, (draft: any) => {
        if (!Array.isArray(draft)) return;
        draft.forEach((acc: DiscoverAccount) => {
          if (acc.id === userId) updater(acc);
        });
      })
    );
    patches.push(patch);
  }

  // Also patch the default suggested search cache (q: '*')
  const patchDefault = dispatch(
    api.util.updateQueryData("searchUsers", { q: "*" }, (draft: any) => {
      if (!Array.isArray(draft)) return;
      draft.forEach((acc: DiscoverAccount) => {
        if (acc.id === userId) updater(acc);
      });
    })
  );
  patches.push(patchDefault);

  return () => {
    patches.forEach((p) => p.undo());
  };
}

