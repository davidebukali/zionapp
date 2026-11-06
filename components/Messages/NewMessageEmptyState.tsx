import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../../assets/styles/theme";

export interface NewMessageEmptyStateProps {
  searchQuery: string;
}

export const NewMessageEmptyState = React.memo(
  function NewMessageEmptyState({ searchQuery }: NewMessageEmptyStateProps) {
    const theme = useTheme();
    const isSearch = Boolean(searchQuery.trim());

    return (
      <View style={[globalStyles.commentsCenteredState, styles.emptyState]}>
        <Ionicons
          name={isSearch ? "search-outline" : "people-outline"}
          size={36}
          color={theme.colors.onSurfaceVariant}
        />
        <Text
          style={[
            globalStyles.commentsStateText,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {isSearch
            ? `No matching accounts for "${searchQuery}"`
            : "Follow accounts to start a conversation."}
        </Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  emptyState: {
    paddingVertical: 48,
  },
});

