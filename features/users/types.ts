import { DiscoverAccount } from "../../components/Discover/types";

export interface BackendMedia {
  id?: string;
  url?: string;
  width?: number;
  height?: number;
}

export interface BackendProfile {
  id?: string;
  user_id?: string;
  username?: string;
  display_name?: string;
  bio?: string;
  is_following?: boolean;
  avatar_media_id?: string | null;
  avatar?: BackendMedia | null;
  cover_media_id?: string | null;
  cover?: BackendMedia | null;
  website?: string | null;
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

