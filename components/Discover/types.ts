import { StyleProp, ViewStyle } from "react-native";

export interface DiscoverAccount {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  initials?: string;
  avatarColor?: string;
  meta: string;
  bio: string;
  isFollowing: boolean;
}

export type DiscoverTabType = "accounts" | "posts";

export interface DiscoverSearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export interface DiscoverFilterBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export interface DiscoverAccountCardProps {
  account: DiscoverAccount;
  onToggleFollow: (accountId: string) => void;
  onPressProfile?: (accountId: string) => void;
}

