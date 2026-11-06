import { StyleProp, ViewStyle } from "react-native";

export type MediaCollageItem = string | { uri?: string; url?: string };

export interface MediaCollageProps {
  items: MediaCollageItem[];
  onEdit?: () => void;
  onRemoveAll?: () => void;
  onPressItem?: (index: number) => void;
  borderRadius?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

export interface MediaCollageThumbnailProps {
  item: MediaCollageItem;
  index: number;
  isOverlay?: boolean;
  overlayCount?: number;
  onPress?: () => void;
}

export interface MediaCollageControlsProps {
  onEdit?: () => void;
  onRemoveAll?: () => void;
}

export interface MediaCollageGridProps {
  items: MediaCollageItem[];
  borderRadius: number;
  onPressItem?: (index: number) => void;
  onEdit?: () => void;
}

