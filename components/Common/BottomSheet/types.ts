import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  closeAccessibilityLabel?: string;
  backdropAccessibilityLabel?: string;
  children: React.ReactNode;
}

export interface BottomSheetActionRowProps {
  label: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  destructive?: boolean;
  showChevron?: boolean;
  showDivider?: boolean;
  accessibilityLabel?: string;
}

export interface ReportReasonOption<TReason extends string = string> {
  label: string;
  value: TReason;
}

export interface ReportReasonListProps<TReason extends string = string> {
  reasons: ReportReasonOption<TReason>[];
  onSelectReason: (reason: TReason) => void;
}
