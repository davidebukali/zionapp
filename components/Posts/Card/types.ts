import { ImageSourcePropType } from "react-native";

export interface PostCardActionsProps {
  // Ownership & Flags
  isOwnPost: boolean;
  isFollowingAuthor: boolean;
  isReposted: boolean;
  repostsCount: number;

  // Header Floating Popover Callbacks (UI Stubs)
  onPressThreeDots?: () => void;
  onPressEdit?: () => void;
  onPressDelete?: () => void;
  onPressFollowToggle?: () => void;
  onPressReport?: () => void;

  // Footer Action Bar Callbacks (UI Stubs)
  onPressLike?: () => void;
  onPressComment?: () => void;
  onPressRepost?: () => void;
  onPressBookmark?: () => void;

  // Share Options Callbacks (UI Stubs)
  onPressShareDM?: () => void;
  onPressShareSystem?: () => void;
}

export interface PostCardProps extends Partial<PostCardActionsProps> {
  title: string;
  createdAt: string | Date;
  body?: string;
  avatarUrl?: string;
  imageUrl?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  imageSource?: ImageSourcePropType;
  likes?: string;
  comments?: string;
  liked?: boolean;
  bookmarked?: boolean;

  // Legacy callback aliases for seamless backwards-compatibility
  onLike?: () => void;
  onComment?: () => void;
}

