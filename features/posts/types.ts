export type FeedItemType = 'post' | 'repost' | 'like' | 'comment';

export interface LaravelMedia {
  id: string;
  type?: string;
  mime_type?: string;
  url: string;
  width?: number;
  height?: number;
}

export interface LaravelUser {
  id: string | number;
  name: string;
  email?: string;
  profile?: {
    username?: string;
    display_name?: string;
    avatar_media_id?: string | null;
    avatar_url?: string;
  } | null;
}

export interface LaravelPost {
  id: string | number;
  content: string;
  visibility?: string;
  user?: LaravelUser;
  author?: LaravelUser;
  media?: LaravelMedia[];
  likes_count?: number;
  comments_count?: number;
  reposts_count?: number;
  is_liked?: boolean;
  liked?: boolean;
  is_reposted?: boolean;
  reposted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FeedItem {
  id: string | number;
  type?: FeedItemType;
  published_at?: string;
  actor?: LaravelUser | null;
  post: LaravelPost;
  created_at?: string;
  updated_at?: string;
}

export interface FeedResponse {
  success?: boolean;
  message?: string;
  data: FeedItem[];
  meta?: {
    prev_cursor?: string | null;
    next_cursor?: string | null;
    per_page?: number;
  };
}

export interface PostsListResponse {
  success?: boolean;
  message?: string;
  data: LaravelPost[];
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
}

export interface RepostResponse {
  success: boolean;
  message: string;
  data: {
    reposted: boolean;
    reposts_count: number;
  };
}

export interface PostActivity {
  type: FeedItemType;
  actor: LaravelUser | null;
  publishedAt?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId?: string | number;
  avatarUrl?: string;
  imageUrl?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  likes?: string;
  comments?: string;
  liked?: boolean;
  isReposted?: boolean;
  reposted?: boolean;
  repostsCount?: number;
  activityType?: FeedItemType;
  activityActor?: string;
  activity?: PostActivity;
  feedItemId?: string | number;
  createdAt: string;
  updatedAt: string;
}

export interface FeedResult {
  posts: Post[];
  nextCursor?: string | null;
}

export interface PostState {
  posts: Post[];
}

export interface UploadUrlRequest {
  filename: string;
  mime_type: string;
  size: number;
}

export interface UploadUrlResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    upload_url: string;
  };
}

export interface ConfirmMediaRequest {
  mediaId: string;
  checksum?: string | null;
}

export interface ConfirmMediaResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    status: string;
  };
}

export interface CreatePostRequest {
  content: string;
  media_ids?: string[];
}

export interface CreatePostResponse {
  success: boolean;
  message?: string;
  data: LaravelPost;
}

export type MediaProcessingStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready'
  | 'failed';

export interface MediaDetail {
  id: string;
  user_id?: string;
  status: MediaProcessingStatus | string;
  type?: string;
  mime_type?: string;
  size?: number;
  width?: number;
  height?: number;
  url?: string;
  metadata?: {
    variants?: Record<string, string>;
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
}

export interface MediaStatusResponse {
  success: boolean;
  message?: string;
  data: MediaDetail;
}
