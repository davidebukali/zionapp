import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export type IconName = keyof typeof Ionicons.glyphMap;

export interface SettingsUser {
  name: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  initials?: string;
}

export interface SettingsUserCardProps {
  user?: SettingsUser | null;
  onPressManage?: () => void;
  style?: StyleProp<ViewStyle>;
}

export interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface SettingsNavItemProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  isDestructive?: boolean;
  showDivider?: boolean;
  accessibilityLabel?: string;
}

export interface SettingsToggleItemProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  showDivider?: boolean;
  accessibilityLabel?: string;
}

export interface SettingsFooterProps {
  version?: string;
  buildNumber?: string;
  appName?: string;
  onCopySuccess?: (copiedText: string) => void;
  style?: StyleProp<ViewStyle>;
}

