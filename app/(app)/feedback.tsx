import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { globalStyles } from '../../assets/styles/theme';
import { FeedbackHeader, FeedbackWebView } from '../../components/Feedback';
import { useFeedbackForm } from '../../hooks/useFeedbackForm';

export default function FeedbackScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {
    prefilledUrl,
    isLoading,
    hasError,
    reloadKey,
    handleRetry,
    handleLoadEnd,
    handleError,
  } = useFeedbackForm();

  return (
    <View
      style={[
        globalStyles.screen,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <FeedbackHeader onBack={() => router.back()} />
      <FeedbackWebView
        url={prefilledUrl}
        isLoading={isLoading}
        hasError={hasError}
        reloadKey={reloadKey}
        onRetry={handleRetry}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
    </View>
  );
}

