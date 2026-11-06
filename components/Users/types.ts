import { TaggableUser } from "../../features/users/types";

export interface FollowedUsersBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectUser: (user: TaggableUser) => void;
}

export interface TaggableUserItemProps {
  user: TaggableUser;
  onPress: (user: TaggableUser) => void;
}

export interface TaggableUsersSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
}

