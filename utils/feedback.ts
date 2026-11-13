export interface FeedbackPrefillParams {
  deviceLabel?: string;
  appVersion?: string;
  username?: string;
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

