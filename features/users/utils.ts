import { DiscoverAccount } from "../../components/Discover/types";
import { getUserAvatarUrl, getUserInitials } from "../../utils/user";
import {
  BackendProfile,
  BackendTaggableUser,
  BackendUser,
  ReportReason,
  TaggableUser,
  TaggableUsersResult,
  UserProfileData,
} from "./types";

export const STATIC_USER_REPORT_REASONS: ReportReason[] = [
  {
    id: "impersonation",
    label: "Impersonation",
    desc: "Pretending to be someone else, a leader, or an organization",
  },
  {
    id: "harassment",
    label: "Harassment or Bullying",
    desc: "Targeted hostility, stalking, or abusive personal attacks",
  },
  {
    id: "hate_speech",
    label: "Hate Speech",
    desc: "Attacks, demeaning slurs, or promoting harm against groups or individuals",
  },
  {
    id: "explicit_content",
    label: "Explicit or Inappropriate Content",
    desc: "Nudity, sexual material, vulgarity, or graphic imagery",
  },
  {
    id: "violence_or_harm",
    label: "Violence or Self-Harm",
    desc: "Threats of physical harm, self-harm, or glorification of violence",
  },
  {
    id: "scam_or_fraud",
    label: "Scam, Fraud, or Deception",
    desc: "Financial exploitation, fake fundraisers, or phishing",
  },
  {
    id: "spam",
    label: "Spam or Bot Activity",
    desc: "Unsolicited ads, repeated link drops, or automated accounts",
  },
  {
    id: "inappropriate_profile",
    label: "Inappropriate Profile",
    desc: "Offensive username, avatar, banner, or bio",
  },
  {
    id: "disruptive_content",
    label: "Disruptive or Bad-Faith Conduct",
    desc: "Content that violates our Christ-centered and family-friendly sanctuary",
  },
  {
    id: "other",
    label: "Other",
    desc: "Issue not listed above (please specify)",
  },
];

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
  const isBlocked = Boolean(rawProfile?.is_blocked ?? false);

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
    isBlocked,
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
 * Inspects all active searchUsers cache entries in state (or given searchArgs)
 * and patches each cache key uniquely.
 *
 * Returns an undo function that reverts patched caches if the API call fails.
 */
export function updateUserInCaches(
  api: any,
  dispatch: any,
  userId: string,
  updater: (account: DiscoverAccount) => void,
  searchArgs?: { q: string },
  state?: unknown
): () => void {
  const patches: Array<{ undo: () => void }> = [];
  const handledQueryArgs = new Set<string>();

  const patchQueryArgs = (args: { q: string }) => {
    const key = JSON.stringify(args);
    if (handledQueryArgs.has(key)) return;
    handledQueryArgs.add(key);

    const patch = dispatch(
      api.util.updateQueryData("searchUsers", args, (draft: any) => {
        if (!Array.isArray(draft)) return;
        draft.forEach((account: DiscoverAccount) => {
          if (account.id === userId) updater(account);
        });
      })
    );
    patches.push(patch);
  };

  // 1. Explicit searchArgs if provided
  if (searchArgs) {
    patchQueryArgs(searchArgs);
  }

  // 2. Default suggested search cache (q: '*')
  patchQueryArgs({ q: "*" });

  // 3. Scan state for all active searchUsers queries in RTK Query state
  const reducerPath = api?.reducerPath || "api";
  const apiState = (state as Record<string, any>)?.[reducerPath];
  const queries = apiState?.queries;
  if (queries && typeof queries === "object") {
    Object.keys(queries).forEach((queryKey) => {
      if (queryKey.startsWith("searchUsers(")) {
        const queryEntry = queries[queryKey];
        if (queryEntry?.originalArgs && typeof queryEntry.originalArgs === "object") {
          patchQueryArgs(queryEntry.originalArgs as { q: string });
        }
      }
    });
  }

  return () => {
    [...patches].reverse().forEach((patch) => patch.undo());
  };
}

/**
 * Determines whether an optimistic follow or unfollow mutation should roll back.
 * Idempotent backend responses or states where the user is already in the target state
 * do not require rolling back.
 *
 * @param queryError The error thrown by queryFulfilled or RTK Query unwrap
 * @param targetFollowingState Desired isFollowing state (true for follow, false for unfollow)
 */
export function shouldRollbackFollowMutation(
  queryError: unknown,
  targetFollowingState: boolean
): boolean {
  if (!queryError || typeof queryError !== "object") {
    return true;
  }

  const errorObj = queryError as {
    status?: number | string;
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
    error?: string;
    message?: string;
  };

  const status = typeof errorObj.status === "number" ? errorObj.status : undefined;
  const message = (
    errorObj.data?.message ||
    errorObj.message ||
    errorObj.error ||
    ""
  ).toLowerCase();

  // If we intended to follow (targetFollowingState === true):
  // 409 Conflict indicates already following.
  // 422 with message indicating already following / request pending.
  if (targetFollowingState) {
    if (status === 409) return false;
    if (
      status === 422 &&
      (message.includes("already following") ||
        message.includes("already sent") ||
        message.includes("already pending"))
    ) {
      return false;
    }
  }

  // If we intended to unfollow (targetFollowingState === false):
  // 404 or 422 indicating user was already not following.
  if (!targetFollowingState) {
    if (status === 404) return false;
    if (
      status === 422 &&
      (message.includes("not following") || message.includes("not currently following"))
    ) {
      return false;
    }
  }

  // Network failures, 500s, self-follow 422, etc. must roll back
  return true;
}

/**
 * Optimistically updates user profile follow status, follower counts, and current user following counts in RTK Query caches.
 */
export function updateProfileFollowInCaches(
  api: any,
  dispatch: any,
  userId: string,
  isFollowing: boolean,
  currentUserId?: string
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

  if (currentUserId) {
    const patchFollowing = dispatch(
      api.util.updateQueryData(
        "getUserFollowingCount",
        String(currentUserId),
        (draft: any) => {
          if (draft && typeof draft.total === "number") {
            draft.total = Math.max(0, draft.total + (isFollowing ? 1 : -1));
          }
        }
      )
    );
    patches.push(patchFollowing);
  }

  return () => {
    [...patches].reverse().forEach((patch) => patch.undo());
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



