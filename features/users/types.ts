import { DiscoverAccount } from "../../components/Discover/types";

export interface BackendMedia {
  id?: string;
  url?: string;
  width?: number;
  height?: number;
  type?: string;
  mime_type?: string;
}

export interface Church {
  id: string;
  name: string;
  location?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface GetChurchesParams {
  search?: string;
  per_page?: number;
}

export interface ChurchesResponse {
  success?: boolean;
  message?: string;
  data: Church[];
  meta?: {
    current_page?: number;
    per_page?: number;
    total?: number;
  };
}

export type AccountClassificationType = "personal" | "organization";

export interface AccountTypeCategoryGroup {
  type: AccountClassificationType;
  label: string;
  categories: string[];
}

export interface AccountTypesResponse {
  data: AccountTypeCategoryGroup[];
}

export interface BackendProfile {
  id?: string;
  user_id?: string;
  username?: string;
  display_name?: string;
  bio?: string;
  is_following?: boolean;
  account_type?: AccountClassificationType | null;
  category?: string | null;
  church_id?: string | null;
  church?: Church | null;
  avatar_media_id?: string | null;
  avatar?: BackendMedia | null;
  cover_media_id?: string | null;
  cover?: BackendMedia | null;
  website?: string | null;
  location?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BackendUser {
  id: string; // ULID string
  name: string;
  email?: string;
  is_following?: boolean;
  profile?: BackendProfile | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfileData {
  id: string;
  userId: string;
  displayName: string;
  username: string;
  bio: string;
  website: string | null;
  location: string | null;
  accountType?: AccountClassificationType | null;
  category?: string | null;
  church?: Church | null;
  joinedAt: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}

export interface UpdateProfilePayload {
  username?: string | null;
  display_name?: string | null;
  bio?: string | null;
  avatar_media_id?: string | null;
  cover_media_id?: string | null;
  website?: string | null;
  location?: string | null;
  account_type?: AccountClassificationType | null;
  category?: string | null;
  church_id?: string | null;
  church_name?: string | null;
  church_location?: string | null;
}

export interface UpdateProfileResponse {
  data: BackendProfile;
  message?: string;
}

export interface FollowListResponse {
  success?: boolean;
  message?: string;
  data?: BackendUser[];
  meta?: {
    meta?: {
      total?: number;
      next_cursor?: string | null;
    };
    total?: number;
  };
}

export interface SearchUsersParams {
  q: string;
  type?: string;
  page?: number;
  per_page?: number;
}

export interface SearchUsersResponse {
  success: boolean;
  message?: string;
  data: BackendUser[];
  meta?: {
    links?: {
      first?: string | null;
      last?: string | null;
      prev?: string | null;
      next?: string | null;
    };
    meta?: {
      current_page?: number;
      from?: number | null;
      last_page?: number;
      per_page?: number;
      to?: number | null;
      total?: number;
    };
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
}

export interface FollowData {
  id: string;
  follower_id: string;
  following_id: string;
  status: "accepted" | "pending" | "rejected" | string;
  follower?: BackendUser | null;
  following?: BackendUser | null;
  created_at?: string;
  updated_at?: string;
}

export interface FollowResponse {
  success: boolean;
  message: string;
  data: FollowData;
  meta?: any;
}

export interface UnfollowResponse {
  success: boolean;
  message: string;
  data: null;
  meta?: any;
}

export interface UserBlockRecord {
  id: number | string;
  blocker_id: string;
  blocked_id: string;
  blocked?: BackendUser;
  created_at: string;
  updated_at: string;
}

export interface BlockUserResponse {
  success: boolean;
  message: string;
  data: UserBlockRecord;
  meta: null;
}

export interface UnblockUserResponse {
  success: boolean;
  message: string;
  data: null;
  meta: null;
}

export interface BlockedUsersListResponse {
  success: boolean;
  message: string;
  data: UserBlockRecord[];
  meta?: {
    prev_cursor?: string | null;
    next_cursor?: string | null;
    per_page?: number;
  } | null;
}

export interface TaggableUserProfile {
  id: string;
  user_id: string;
  username: string;
  display_name?: string | null;
  bio?: string | null;
  account_type?: string | null;
  avatar?: {
    id?: string;
    url?: string | null;
  } | null;
}

export interface BackendTaggableUser {
  id: string;
  name: string;
  email?: string | null;
  is_following?: boolean;
  profile?: TaggableUserProfile | null;
}

export interface TaggableUser {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  initials: string;
  isFollowing?: boolean;
}

export interface GetTaggableUsersParams {
  q?: string;
  per_page?: number;
  cursor?: string | null;
}

export interface TaggableUsersResponse {
  success: boolean;
  message: string;
  data: BackendTaggableUser[];
  meta?: {
    links?: {
      first?: string | null;
      last?: string | null;
      prev?: string | null;
      next?: string | null;
    };
    meta?: {
      path?: string;
      per_page?: number;
      next_cursor?: string | null;
      prev_cursor?: string | null;
    };
  } | null;
}

export interface TaggableUsersResult {
  users: TaggableUser[];
  nextCursor: string | null;
}


