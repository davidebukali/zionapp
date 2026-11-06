import { KeyboardTypeOptions } from "react-native";
import { Church } from "../../../features/users/types";
import {
  AccountClassificationBottomSheetProps,
  AccountClassificationCardRowProps,
  AccountClassificationType,
  ClassificationOptionCardProps,
} from "../../Common/AccountClassification";

export type {
  AccountClassificationBottomSheetProps,
  AccountClassificationCardRowProps,
  AccountClassificationType,
  ClassificationOptionCardProps,
};

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

export interface ChurchDropdownSelectorProps {
  selectedChurchId: string | null;
  initialChurch?: Church | null;
  onSelectChurch: (church: Church | null) => void;
}

export interface ChurchPickerModalProps {
  visible: boolean;
  selectedChurchId: string | null;
  onSelectChurch: (church: Church | null) => void;
  onClose: () => void;
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

