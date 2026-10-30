import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../../../assets/styles/theme";

export default function MessagesScreen() {
  const theme = useTheme();

  return (
    <View
      style={[
        globalStyles.screen,
        globalStyles.commentsCenteredState,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Ionicons
        name="paper-plane-outline"
        size={56}
        color={theme.colors.onSurfaceVariant}
      />
      <Text
        style={[
          globalStyles.commentsStateText,
          { color: theme.colors.onSurfaceVariant },
        ]}
      >
        No messages yet
      </Text>
    </View>
  );
}

