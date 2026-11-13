import { useState, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { FEEDBACK_FORM_URL } from '../constants';
import { buildPrefilledFeedbackUrl } from '../utils/feedback';

export function useFeedbackForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const prefilledUrl = useMemo(() => {
    const model = Device.modelName || 'Device';
    const osName = Platform.OS === 'ios' ? 'iOS' : 'Android';
    const deviceLabel = `${osName} (${model} - OS ${Platform.Version})`;

    const appVersionNumber = Constants.expoConfig?.version || '1.0.0';
    const buildNumber =
      Platform.OS === 'ios'
        ? Constants.expoConfig?.ios?.buildNumber || '1'
        : Constants.expoConfig?.android?.versionCode || '1';
    const appVersion = `${appVersionNumber} (${buildNumber})`;

    const username =
      currentUser?.profile?.username ||
      currentUser?.name ||
      currentUser?.email ||
      '';

    return buildPrefilledFeedbackUrl(FEEDBACK_FORM_URL, {
      deviceLabel,
      appVersion,
      username,
    });
  }, [currentUser]);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  }, []);

  return {
    prefilledUrl,
    isLoading,
    hasError,
    reloadKey,
    handleLoadEnd,
    handleError,
    handleRetry,
  };
}

