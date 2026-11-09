export type NotificationType =
  | 'post_liked'
  | 'comment_liked'
  | 'post_commented'
  | 'post_reposted'
  | 'post_shared'
  | 'user_followed'
  | 'follow_requested'
  | 'follow_request_accepted'
  | 'user_tagged'
  | 'post_reported';

export interface GroupedPostLikedData {
  event: 'post_liked';
  post_id: string;
  actors_count: number;
  actor_ids: string[];
}

export interface GenericNotificationData {
  actor_name?: string;
  post_id?: string;
  comment_id?: string;
  content?: string;
  comment_content?: string;
  notifiable_type?: string;
  notifiable_id?: string;
  reason?: string;
  [key: string]: unknown;
}

export interface MediaItem {
  id: string;
  url: string;
  mime_type?: string;
}

export interface ProfileItem {
  id: string;
  user_id: string;
  username: string;
  display_name?: string | null;
  bio?: string | null;
  account_type?: string | null;
  category?: string | null;
  location?: string | null;
  church_id?: string | null;
  avatar_media_id?: string | null;
  avatar?: MediaItem | null;
  is_private: boolean;
}

export interface ActorItem {
  id: string;
  name: string;
  email: string;
  is_following?: boolean;
  profile?: ProfileItem | null;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  actor_id: string | null;
  actor: ActorItem | null;
  type: NotificationType;
  notifiable_type: string;
  notifiable_id: string;
  data: GroupedPostLikedData | GenericNotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationsPaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface NotificationsPaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface NotificationsResponse {
  data: NotificationItem[];
  links: NotificationsPaginationLinks;
  meta: NotificationsPaginationMeta;
}

export interface GetNotificationsParams {
  page?: number;
  per_page?: number;
}

export type NotificationFilterTab = 'all' | 'mentions';

export type NotificationSectionTitle = 'Today' | 'Yesterday' | 'Earlier';

export interface NotificationSection {
  title: NotificationSectionTitle;
  data: NotificationItem[];
}

export interface FormattedNotificationCopy {
  actorSummary: string;
  actionDescription: string;
  fullMessage: string;
  quoteSnippet?: string;
}

export type NotificationBadgeVariant =
  | 'like'
  | 'comment'
  | 'mention'
  | 'repost'
  | 'follow';

