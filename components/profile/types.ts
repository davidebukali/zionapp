import { Post } from "../../features/posts/types";
import { UserProfileData } from "../../features/users/types";

export type ProfileTabType = "posts" | "likes" | "reposts" | "bookmarks";

export interface ProfileHeaderProps {
  profile: UserProfileData;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  isFollowLoading?: boolean;
  onPressBack: () => void;
  onPressEditProfile?: () => void;
  onPressMessage?: () => void;
  onPressToggleFollow?: () => void;
  onPressMoreMenu?: (anchorPosition?: { x: number; y: number; width: number; height: number }) => void;
}

export interface ProfileInfoProps {
  profile: UserProfileData;
}

export interface ProfileTabsProps {
  activeTab: ProfileTabType;
  onSelectTab: (tab: ProfileTabType) => void;
  isOwnProfile?: boolean;
}

export interface ProfileFeedProps {
  activeTab: ProfileTabType;
  posts: Post[];
  isPostsLoading: boolean;
  isFetchingMore?: boolean;
  isPrivateAccount?: boolean;
  isFollowLoading?: boolean;
  currentUserId?: string | number;
  onLikePost?: (postId: string, liked: boolean) => void;
  onRepostPost?: (postId: string) => void;
  onBookmarkPost?: (postId: string) => void;
  onCommentPost?: (postId: string) => void;
  onPressFollow?: () => void;
}

