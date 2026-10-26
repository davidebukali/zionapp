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
  };
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
  is_liked?: boolean;
  liked?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FeedItem {
  id: string | number;
  published_at?: string;
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

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  avatarUrl?: string;
  imageUrl?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  likes?: string;
  comments?: string;
  liked?: boolean;
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

export function normalizePost(raw: LaravelPost, fallbackDate?: string): Post {
  const authorName = raw.user?.name || raw.author?.name || 'Zion Member';
  const firstMedia = raw.media && raw.media.length > 0 ? raw.media[0] : undefined;
  const imageUrl = firstMedia?.url;
  const mediaWidth = firstMedia?.width;
  const mediaHeight = firstMedia?.height;
  const createdAt = raw.created_at || fallbackDate || new Date().toISOString();
  const updatedAt = raw.updated_at || createdAt;

  return {
    id: String(raw.id),
    title: authorName,
    content: raw.content || '',
    author: authorName,
    avatarUrl: undefined,
    imageUrl,
    mediaWidth,
    mediaHeight,
    likes: typeof raw.likes_count === 'number' ? String(raw.likes_count) : '0',
    comments: typeof raw.comments_count === 'number' ? String(raw.comments_count) : '0',
    liked: Boolean(raw.is_liked ?? raw.liked ?? false),
    createdAt,
    updatedAt,
  };
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