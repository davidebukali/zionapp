import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, TextInput, TouchableOpacity, View } from "react-native";
import { Avatar, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { globalStyles } from "../../assets/styles/theme";

type CommentPageProps = {
  value: string;
  initials: string;
  isSubmitting?: boolean;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
};

export function CommentPage({
  value,
  initials,
  isSubmitting = false,
  onChangeText,
  onSubmit,
}: CommentPageProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const canSubmit = value.trim().length > 0 && !isSubmitting;

  return (
    <View
      style={[
        globalStyles.commentComposerContainer,
        {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.outlineVariant,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <Avatar.Text
        size={40}
        label={initials}
        color="#FFFFFF"
        style={{ backgroundColor: "#278CCB" }}
        labelStyle={{ fontSize: 13, fontWeight: "700" }}
      />
      <View
        style={[
          globalStyles.commentComposerInputShell,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <TextInput
          accessibilityLabel="Comment text"
          multiline
          placeholder="Add a comment..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={value}
          onChangeText={onChangeText}
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
  );
}
