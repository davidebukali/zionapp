import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

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
    <View style={styles.header}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Close"
        disabled={isPosting}
        onPress={onClose}
        style={[
          styles.closeButton,
          {
            backgroundColor: theme.colors.surfaceVariant,
            opacity: isPosting ? 0.5 : 1,
          },
        ]}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={22} color={theme.colors.onSurface} />
      </TouchableOpacity>

      <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
        New post
      </Text>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Post"
        disabled={disabled}
        onPress={onPublish}
        style={[
          styles.postButton,
          {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        activeOpacity={0.8}
      >
        {isPosting ? (
          <View style={styles.postingContainer}>
            <ActivityIndicator
              size="small"
              color={theme.colors.onPrimary}
              style={styles.spinner}
            />
            <Text style={[styles.postButtonText, { color: theme.colors.onPrimary }]}>
              {postingStatus || "Posting..."}
            </Text>
          </View>
        ) : (
          <Text style={[styles.postButtonText, { color: theme.colors.onPrimary }]}>
            Post
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  postButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    minHeight: 40,
  },
  postingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  spinner: {
    marginRight: 6,
  },
  postButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
