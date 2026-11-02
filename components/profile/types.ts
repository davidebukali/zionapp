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
}

export interface ProfileInfoProps {
  profile: UserProfileData;
}

export interface ProfileTabsProps {
  activeTab: ProfileTabType;
  onSelectTab: (tab: ProfileTabType) => void;
}

export interface ProfileFeedProps {
  activeTab: ProfileTabType;
  posts: Post[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onEndReached?: () => void;
  onPressPost?: (postId: string) => void;
}

