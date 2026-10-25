import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../../../assets/styles/theme";

interface PostToolbarProps {
  onPickMedia: () => void;
  onOpenEmoji: () => void;
  remainingChars: number;
  disabled: boolean;
}

export function PostToolbar({
  onPickMedia,
  onOpenEmoji,
  remainingChars,
  disabled,
}: PostToolbarProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      style={[
        globalStyles.row,
        {
          backgroundColor: theme.colors.background,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View style={[globalStyles.postActionGroup, { gap: 16 }]}>
        <TouchableOpacity
          accessibilityLabel="Add media from gallery"
          style={globalStyles.postIconButton}
          onPress={onPickMedia}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons name="image-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityLabel="Mention"
          style={globalStyles.postIconButton}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons name="at-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityLabel="Add emoji"
          style={globalStyles.postIconButton}
          onPress={onOpenEmoji}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons name="happy-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <Text
        style={[
          globalStyles.postActionText,
          { color: theme.colors.onSurfaceVariant, fontSize: 14, fontWeight: "500" },
        ]}
      >
        {remainingChars}
      </Text>
    </View>
  );
}
