import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { globalStyles } from "../../assets/styles/theme";

type CommentsHeaderProps = {
  count: string;
  onBack: () => void;
};

export function CommentsHeader({ count, onBack }: CommentsHeaderProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      style={[
        globalStyles.commentsHeader,
        {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.outlineVariant,
          paddingTop: insets.top,
          minHeight: insets.top + 64,
        },
      ]}
    >
      <StatusBar
        backgroundColor={theme.colors.background}
        style={colorScheme === "dark" ? "light" : "dark"}
      />
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        style={[
          globalStyles.commentsBackButton,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <Ionicons name="arrow-back" size={23} color={theme.colors.onSurface} />
      </TouchableOpacity>
      <Text style={[globalStyles.commentsHeaderTitle, { color: theme.colors.onSurface }]}>
        Comments
      </Text>
      <View
        style={[
          globalStyles.commentsCountBadge,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <Text style={[globalStyles.commentsCountText, { color: theme.colors.onSurface }]}>
          {count}
        </Text>
      </View>
    </View>
  );
}
