import { DiscoverAccount } from "../../components/Discover/types";
import { getUserAvatarUrl, getUserInitials } from "../../utils/user";
import { BackendProfile, BackendUser, UserProfileData } from "./types";

/**
 * Normalizes a raw BackendProfile or BackendUser into a strongly typed UserProfileData model.
 */
export function normalizeUserProfile(
  rawProfile?: BackendProfile | null,
  rawUser?: BackendUser | null,
  counts?: { followers?: number; following?: number }
): UserProfileData {
  const id = String(rawProfile?.id || rawUser?.id || "");
  const userId = String(rawProfile?.user_id || rawUser?.id || id);
  const displayName =
    rawProfile?.display_name?.trim() ||
    rawUser?.name?.trim() ||
    "Member";
  const username =
    rawProfile?.username?.trim() ||
    rawUser?.name?.toLowerCase().replace(/\s+/g, "") ||
    "user";
  const bio = rawProfile?.bio?.trim() || "";
  const website = rawProfile?.website?.trim() || null;
  const location = rawProfile?.location?.trim() || null;
  const joinedAt = rawProfile?.created_at || rawUser?.created_at || null;
  const avatarUrl =
    rawProfile?.avatar?.url ||
    (rawUser ? getUserAvatarUrl(rawUser) : null) ||
    null;
  const coverUrl = rawProfile?.cover?.url || null;
  const isFollowing = Boolean(
    rawProfile?.is_following ?? rawUser?.is_following ?? false
  );
  const followersCount = counts?.followers ?? 0;
  const followingCount = counts?.following ?? 0;

  return {
    id,
    userId,
    displayName,
    username,
    bio,
    website,
    location,
    joinedAt,
    avatarUrl,
    coverUrl,
    isFollowing,
    followersCount,
    followingCount,
  };
}

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

/**
 * Optimistically updates user profile follow status and follower counts in RTK Query caches.
 */
export function updateProfileFollowInCaches(
  api: any,
  dispatch: any,
  userId: string,
  isFollowing: boolean
): () => void {
  const patches: Array<{ undo: () => void }> = [];

  const patchProfile = dispatch(
    api.util.updateQueryData("getUserProfile", userId, (draft: any) => {
      if (draft) {
        draft.is_following = isFollowing;
      }
    })
  );
  patches.push(patchProfile);

  const patchFollowers = dispatch(
    api.util.updateQueryData("getUserFollowersCount", userId, (draft: any) => {
      if (draft && typeof draft.total === "number") {
        draft.total = Math.max(0, draft.total + (isFollowing ? 1 : -1));
      }
    })
  );
  patches.push(patchFollowers);

  return () => {
    patches.forEach((p) => p.undo());
  };
}


