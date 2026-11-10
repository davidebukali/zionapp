import { DiscoverAccount } from "../../components/Discover/types";
import { getUserAvatarUrl, getUserInitials } from "../../utils/user";
import {
  BackendProfile,
  BackendTaggableUser,
  BackendUser,
  TaggableUser,
  TaggableUsersResult,
  UserProfileData,
} from "./types";

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
  const accountType = rawProfile?.account_type || null;
  const category = rawProfile?.category?.trim() || null;
  const church = rawProfile?.church || null;
  const followersCount = counts?.followers ?? 0;
  const followingCount = counts?.following ?? 0;
  const isPrivate = Boolean(rawProfile?.is_private ?? false);

  return {
    id,
    userId,
    displayName,
    username,
    bio,
    website,
    location,
    accountType,
    category,
    church,
    joinedAt,
    avatarUrl,
    coverUrl,
    isFollowing,
    followersCount,
    followingCount,
    isPrivate,
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

/**
 * Normalizes a raw BackendTaggableUser from GET /users/taggable to client TaggableUser model.
 */
export function normalizeTaggableUser(raw: BackendTaggableUser): TaggableUser {
  const displayName =
    raw.profile?.display_name?.trim() || raw.name?.trim() || "Member";
  const username =
    raw.profile?.username?.trim() ||
    raw.name?.toLowerCase().replace(/\s+/g, "") ||
    "user";
  const initials = getUserInitials(displayName, raw.email || undefined);
  const avatarUrl = raw.profile?.avatar?.url || null;

  return {
    id: String(raw.id),
    name: displayName,
    username,
    avatarUrl,
    initials,
    isFollowing: raw.is_following ?? false,
  };
}

/**
 * Merges paginated taggable users into RTK Query cache avoiding duplicates by ID.
 */
export function mergeTaggableUsersCache(
  currentCache: TaggableUsersResult,
  incoming: TaggableUsersResult,
  cursor?: string | null
): void {
  if (!cursor) {
    currentCache.users = incoming.users;
    currentCache.nextCursor = incoming.nextCursor;
    return;
  }

  const existingIds = new Set(currentCache.users.map((user) => user.id));
  const uniqueIncoming = incoming.users.filter(
    (user) => !existingIds.has(user.id)
  );
  currentCache.users = [...currentCache.users, ...uniqueIncoming];
  currentCache.nextCursor = incoming.nextCursor;
}

/**
 * Synchronizes active @username mentions in content with registered tagged user IDs.
 * Deduplicates and caps at a maximum of 20 IDs.
 */
export function syncTaggedUserIds(
  content: string,
  taggedUsersMap: Map<string, string>
): string[] {
  if (!content || taggedUsersMap.size === 0) {
    return [];
  }

  const mentionRegex = /@([a-zA-Z0-9_.-]+)/g;
  const activeUsernames = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = mentionRegex.exec(content)) !== null) {
    activeUsernames.add(match[1]);
  }

  const matchedIds = new Set<string>();
  for (const username of activeUsernames) {
    const userId = taggedUsersMap.get(username);
    if (userId) {
      matchedIds.add(userId);
    }
  }

  return Array.from(matchedIds).slice(0, 20);
}

/**
 * Inserts or replaces @username at the current cursor position.
 * If hadTypedAtSymbol is true, replaces the preceding '@' character to avoid '@@username'.
 */
export function replaceMentionAtCursor(
  text: string,
  cursorPosition: number,
  username: string,
  hadTypedAtSymbol: boolean
): { newText: string; newCursorPosition: number } {
  const safeCursor = Math.max(0, Math.min(cursorPosition, text.length));
  const mentionText = `@${username} `;

  let start = safeCursor;
  if (hadTypedAtSymbol && safeCursor > 0 && text.charAt(safeCursor - 1) === "@") {
    start = safeCursor - 1;
  }

  const before = text.slice(0, start);
  const after = text.slice(safeCursor);
  const newText = `${before}${mentionText}${after}`;
  const newCursorPosition = start + mentionText.length;

  return { newText, newCursorPosition };
}

/**
 * Checks whether the text up to cursor ends with an '@' preceded by start-of-line or whitespace.
 */
export function shouldTriggerMentionSheet(textBeforeCursor: string): boolean {
  return /(?:^|\s)@$/.test(textBeforeCursor);
}



