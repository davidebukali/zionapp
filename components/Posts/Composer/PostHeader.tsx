import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../../../assets/styles/theme";

interface PostHeaderProps {
  onClose: () => void;
  onPublish: () => void;
  isPosting: boolean;
  postingStatus: string | null;
  disabled: boolean;
}

export function PostHeader({
  onClose,
  onPublish,
  isPosting,
  postingStatus,
  disabled,
}: PostHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[globalStyles.row, { height: 56, paddingHorizontal: 16 }]}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Close"
        disabled={isPosting}
        onPress={onClose}
        style={[
          globalStyles.postIconButton,
          {
            borderRadius: 20,
            backgroundColor: theme.colors.surfaceVariant,
            opacity: isPosting ? 0.5 : 1,
          },
        ]}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={22} color={theme.colors.onSurface} />
      </TouchableOpacity>

      <Text
        style={[
          globalStyles.commentsHeaderTitle,
          { color: theme.colors.onBackground, textAlign: "center" },
        ]}
      >
        New post
      </Text>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Post"
        disabled={disabled}
        onPress={onPublish}
        style={{
          minHeight: 40,
          paddingHorizontal: 18,
          borderRadius: 20,
          backgroundColor: theme.colors.primary,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.6 : 1,
          elevation: 4,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}
        activeOpacity={0.8}
      >
        {isPosting ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ActivityIndicator
              size="small"
              color={theme.colors.onPrimary}
              style={{ marginRight: 6 }}
            />
            <Text style={[globalStyles.primaryButtonText, { fontSize: 15 }]}>
              {postingStatus || "Posting..."}
            </Text>
          </View>
        ) : (
          <Text style={[globalStyles.primaryButtonText, { fontSize: 15 }]}>
            Post
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
