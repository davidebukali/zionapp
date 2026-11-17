import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { FEEDBACK_FORM_URL } from '../constants';

export interface FeedbackPrefillParams {
  deviceLabel?: string;
  appVersion?: string;
  username?: string;
}

export interface FeedbackUserMetadata {
  name?: string;
  email?: string;
  profile?: { username?: string };
}

/**
 * Builds a Google Forms URL with pre-filled query parameters for device, app version, and username.
 */
export function buildPrefilledFeedbackUrl(
  baseUrl: string,
  params: FeedbackPrefillParams
): string {
  const cleanBase = baseUrl.split('?')[0];
  const queryParts: string[] = ['usp=pp_url'];

  if (params.deviceLabel) {
    queryParts.push(`entry.1171582430=${encodeURIComponent(params.deviceLabel)}`);
  }
  if (params.appVersion) {
    queryParts.push(`entry.1534061409=${encodeURIComponent(params.appVersion)}`);
  }
  if (params.username) {
    queryParts.push(`entry.1086525665=${encodeURIComponent(params.username)}`);
  }

  return `${cleanBase}?${queryParts.join('&')}`;
}

/**
 * Assembles device diagnostics, app version, and user info to produce a complete pre-filled feedback URL.
 */
export function buildFeedbackFormUrl(
  currentUser?: FeedbackUserMetadata | null,
  baseUrl: string = FEEDBACK_FORM_URL
): string {
  const modelName = Device.modelName || 'Device';
  const operatingSystemName = Platform.OS === 'ios' ? 'iOS' : 'Android';
  const deviceLabel = `${operatingSystemName} (${modelName} - OS ${Platform.Version})`;

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

  return buildPrefilledFeedbackUrl(baseUrl, {
    deviceLabel,
    appVersion,
    username,
  });
}
