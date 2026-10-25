import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "react-native-paper";
import { globalStyles } from "../../assets/styles/theme";
import { PrimaryButton } from "../PrimaryButton";
import { isNetworkError, isServerError, getErrorMessage } from "../../utils/network";

interface ErrorStateViewProps {
  error?: unknown;
  title?: string;
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ErrorStateView({
  error,
  title,
  message,
  onRetry,
  isRetrying = false,
}: ErrorStateViewProps) {
  const theme = useTheme();

  const networkErr = isNetworkError(error);
  const serverErr = isServerError(error);

  let iconName: keyof typeof Ionicons.glyphMap = "alert-circle-outline";
  let displayTitle = title || "Something Went Wrong";
  let displayMessage = message || getErrorMessage(error);

  if (networkErr) {
    iconName = "cloud-offline-outline";
    if (!title) displayTitle = "No Internet Connection";
    if (!message) displayMessage = "Please check your network connection and try again.";
  } else if (serverErr) {
    iconName = "server-outline";
    if (!title) displayTitle = "Server Unavailable";
    if (!message) displayMessage = "Our servers are experiencing technical issues. Please try again soon.";
  }

  const iconColor = theme.colors.error || "#DE3A3A";

  return (
    <ScrollView
      contentContainerStyle={[globalStyles.scrollContent, styles.scrollCenter]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRetrying}
          onRefresh={onRetry}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
    >
      <View style={[globalStyles.fullWidth, styles.contentContainer]}>
        {/* Error Icon Badge */}
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: theme.dark
                ? "rgba(222, 58, 58, 0.12)"
                : "rgba(222, 58, 58, 0.08)",
              borderColor: theme.dark
                ? "rgba(222, 58, 58, 0.25)"
                : "rgba(222, 58, 58, 0.18)",
            },
          ]}
        >
          <Ionicons name={iconName} size={58} color={iconColor} />
        </View>

        {/* Heading */}
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {displayTitle}
        </Text>

        {/* Explanatory Message */}
        <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          {displayMessage}
        </Text>

        {/* Retry Button */}
        <PrimaryButton
          title="Try Again"
          onPress={onRetry}
          loading={isRetrying}
          style={globalStyles.buttonHalf}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollCenter: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  contentContainer: {
    maxWidth: 380,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 32,
  },
});

export default ErrorStateView;
