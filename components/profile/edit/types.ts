import { KeyboardTypeOptions } from "react-native";
import { Church } from "../../../features/users/types";

export type AccountClassificationType = "individual" | "organization";

export interface EditProfileHeaderProps {
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export interface EditProfileBannerProps {
  coverUri: string | null;
  avatarUri: string | null;
  initials: string;
  isUploadingCover: boolean;
  isUploadingAvatar: boolean;
  onPickCover: () => void;
  onRemoveCover: () => void;
  onPickAvatar: () => void;
}

export interface ProfileInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  keyboardType?: KeyboardTypeOptions;
}

export interface AccountClassificationCardRowProps {
  accountType: AccountClassificationType;
  onPressCard: (type: AccountClassificationType) => void;
}

export interface AccountClassificationBottomSheetProps {
  visible: boolean;
  initialAccountType: AccountClassificationType;
  initialCategory: string;
  onClose: () => void;
  onConfirm: (
    accountType: AccountClassificationType,
    category: string
  ) => void;
}

export interface ChurchDropdownSelectorProps {
  selectedChurchId: string | null;
  initialChurch?: Church | null;
  onSelectChurch: (church: Church | null) => void;
}

export interface EditProfileFormProps {
  displayName: string;
  onChangeDisplayName: (val: string) => void;
  username: string;
  onChangeUsername: (val: string) => void;
  bio: string;
  onChangeBio: (val: string) => void;
  location: string;
  onChangeLocation: (val: string) => void;
  website: string;
  onChangeWebsite: (val: string) => void;
  accountType: AccountClassificationType;
  category: string;
  onChangeClassification: (
    accountType: AccountClassificationType,
    category: string
  ) => void;
  selectedChurchId: string | null;
  initialChurch?: Church | null;
  onSelectChurch: (church: Church | null) => void;
  coverUri: string | null;
  avatarUri: string | null;
  initials: string;
  isUploadingCover: boolean;
  isUploadingAvatar: boolean;
  onPickCover: () => void;
  onRemoveCover: () => void;
  onPickAvatar: () => void;
}

