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
  userId?: string | null;
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


