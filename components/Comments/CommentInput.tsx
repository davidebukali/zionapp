import Ionicons from "@expo/vector-icons/Ionicons";
import {
  ActivityIndicator,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputSelectionChangeEventData,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { globalStyles } from "../../assets/styles/theme";

type CommentInputProps = {
  value: string;
  initials: string;
  avatarUrl?: string;
  isSubmitting?: boolean;
  replyingTo?: { username: string } | null;
  onCancelReply?: () => void;
  onChangeText: (value: string) => void;
  onSelectionChange?: (
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>
  ) => void;
  onSubmit: () => void;
};

export function CommentInput({
  value,
  initials,
  avatarUrl,
  isSubmitting = false,
  replyingTo,
  onCancelReply,
  onChangeText,
  onSelectionChange,
  onSubmit,
}: CommentInputProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const canSubmit = value.trim().length > 0 && !isSubmitting;
  const placeholder = replyingTo ? `Reply to @${replyingTo.username}...` : "Add a comment...";

  return (
    <View
      style={[
        styles.outerContainer,
        {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.outlineVariant,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      {replyingTo ? (
        <View
          style={[
            styles.replyBanner,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderBottomColor: theme.colors.outlineVariant,
            },
          ]}
        >
          <Ionicons name="return-down-forward" size={16} color={theme.colors.primary} />
          <Text style={[styles.replyBannerText, { color: theme.colors.onSurfaceVariant }]}>
            Replying to{" "}
            <Text style={[styles.replyBannerUsername, { color: theme.colors.primary }]}>
              @{replyingTo.username}
            </Text>
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Cancel reply"
            onPress={onCancelReply}
            hitSlop={8}
            style={styles.cancelReplyButton}
          >
            <Ionicons name="close-circle" size={18} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={globalStyles.commentComposerContainer}>
        {avatarUrl ? (
          <Avatar.Image size={40} source={{ uri: avatarUrl }} />
        ) : (
          <Avatar.Text
            size={40}
            label={initials}
            color={theme.colors.onPrimary}
            style={{ backgroundColor: theme.colors.primary }}
            labelStyle={styles.avatarLabel}
          />
        )}
        <View
          style={[
            globalStyles.commentComposerInputShell,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <TextInput
            accessibilityLabel="Comment text"
            multiline
            placeholder={placeholder}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={value}
            onChangeText={onChangeText}
            onSelectionChange={onSelectionChange}
            onSubmitEditing={onSubmit}
            style={[globalStyles.commentComposerInput, { color: theme.colors.onSurface }]}
          />
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Post comment"
            disabled={!canSubmit}
            onPress={onSubmit}
            style={[
              globalStyles.commentSendButton,
              {
                backgroundColor: canSubmit
                  ? theme.colors.primary
                  : theme.colors.surfaceDisabled,
              },
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : (
              <Ionicons name="paper-plane-outline" size={20} color={theme.colors.onPrimary} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  replyBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  replyBannerText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
  },
  replyBannerUsername: {
    fontWeight: "700",
  },
  cancelReplyButton: {
    padding: 2,
  },
  avatarLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
});
