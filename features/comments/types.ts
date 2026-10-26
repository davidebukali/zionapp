export interface LaravelCommentUser {
  id: string | number;
  name: string;
  email?: string;
  profile?: {
    username?: string;
    display_name?: string;
    avatar?: {
      url?: string;
    } | null;
  };
}

export interface LaravelComment {
  id: string | number;
  post_id: string | number;
  user_id?: string | number | null;
  parent_comment_id?: string | number | null;
  content: string;
  likes_count?: number;
  replies_count?: number;
  is_liked?: boolean;
  user?: LaravelCommentUser | null;
  media?: any[];
  created_at: string;
  updated_at?: string;
}

export interface CommentsResponse {
  success?: boolean;
  message?: string | null;
  data: LaravelComment[];
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
  };
}

export interface SingleCommentResponse {
  success?: boolean;
  message?: string | null;
  data: LaravelComment;
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  username: string;
  body: string;
  avatarUrl?: string;
  avatarColor?: string;
  likes: number;
  liked: boolean;
  replies: number;
  createdAt: string;
}

export interface CommentsResult {
  comments: Comment[];
  nextCursor?: string | null;
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
  media_ids?: string[];
  parent_comment_id?: string;
}

export function normalizeComment(raw: LaravelComment): Comment {
  const authorName =
    raw.user?.profile?.display_name ||
    raw.user?.name ||
    (raw.user_id ? "Member" : "Deleted User");

  const username =
    raw.user?.profile?.username ||
    (raw.user?.name
      ? raw.user.name.toLowerCase().replace(/\s+/g, "")
      : "member");

  const avatarUrl = raw.user?.profile?.avatar?.url ?? undefined;

  return {
    id: String(raw.id),
    postId: String(raw.post_id),
    author: authorName,
    username,
    body: raw.content || "",
    avatarUrl,
    likes: typeof raw.likes_count === "number" ? raw.likes_count : 0,
    liked: Boolean(raw.is_liked ?? false),
    replies: typeof raw.replies_count === "number" ? raw.replies_count : 0,
    createdAt: raw.created_at || new Date().toISOString(),
  };
}
