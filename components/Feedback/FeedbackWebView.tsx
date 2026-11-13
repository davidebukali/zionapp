import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { globalStyles } from '../../assets/styles/theme';

export interface FeedbackWebViewProps {
  url: string;
  isLoading: boolean;
  hasError: boolean;
  reloadKey?: number;
  onRetry: () => void;
  onLoadEnd: () => void;
  onError: () => void;
}

export function FeedbackWebView({
  url,
  isLoading,
  hasError,
  reloadKey,
  onRetry,
  onLoadEnd,
  onError,
}: FeedbackWebViewProps) {
  const theme = useTheme();

  if (hasError) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Ionicons
          name="cloud-offline-outline"
          size={56}
          color={theme.colors.onSurfaceVariant}
          style={styles.errorIcon}
        />
        <Text
          style={[styles.errorTitle, { color: theme.colors.onBackground }]}
        >
          Unable to load feedback form
        </Text>
        <Text
          style={[
            styles.errorSubtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Please check your internet connection and try again.
        </Text>
        <TouchableOpacity
          onPress={onRetry}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Try loading form again"
          style={[
            globalStyles.primaryButton,
            styles.retryButton,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text style={globalStyles.primaryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe
          src={url}
          style={styles.webIframe as any}
          title="Feedback Form"
          onLoad={onLoadEnd}
        />
      ) : (
        <WebView
          key={reloadKey}
          source={{ uri: url }}
          javaScriptEnabled
          domStorageEnabled
          thirdPartyCookiesEnabled
          sharedCookiesEnabled
          allowsBackForwardNavigationGestures
          onLoadEnd={onLoadEnd}
          onError={onError}
          style={[styles.webView, { backgroundColor: theme.colors.background }]}
        />
      )}

      {isLoading && (
        <View
          style={[
            styles.loadingOverlay,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  webIframe: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 160,
  },
});
