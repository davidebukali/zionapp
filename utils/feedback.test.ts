import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import {
  buildPrefilledFeedbackUrl,
  buildFeedbackFormUrl,
} from './feedback';

jest.mock('expo-device', () => ({
  modelName: 'Pixel 8',
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    version: '2.1.0',
    android: { versionCode: 42 },
    ios: { buildNumber: '10' },
  },
}));

describe('buildPrefilledFeedbackUrl', () => {
  const BASE_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLSfy89QGSk5n0BhfVNm9SmI3ej86Nzp58mDOFdHirtQqZEhIwA/viewform';

  it('builds URL with all prefilled parameters encoded', () => {
    const url = buildPrefilledFeedbackUrl(BASE_URL, {
      deviceLabel: 'Android (Pixel 7 - OS 14)',
      appVersion: '1.0.0 (1)',
      username: 'devserene',
    });

    expect(url).toContain('usp=pp_url');
    expect(url).toContain(
      'entry.1171582430=Android%20(Pixel%207%20-%20OS%2014)'
    );
    expect(url).toContain('entry.1534061409=1.0.0%20(1)');
    expect(url).toContain('entry.1086525665=devserene');
  });

  it('strips existing query params from baseUrl before appending', () => {
    const urlWithParams = `${BASE_URL}?usp=header&extra=123`;
    const url = buildPrefilledFeedbackUrl(urlWithParams, {
      username: 'tester',
    });

    expect(url.startsWith(BASE_URL)).toBe(true);
    expect(url).not.toContain('usp=header');
    expect(url).not.toContain('extra=123');
    expect(url).toContain('usp=pp_url');
    expect(url).toContain('entry.1086525665=tester');
  });

  it('handles empty or omitted parameters gracefully', () => {
    const url = buildPrefilledFeedbackUrl(BASE_URL, {});
    expect(url).toBe(`${BASE_URL}?usp=pp_url`);
  });
});

describe('buildFeedbackFormUrl', () => {
  const originalPlatformOS = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      value: originalPlatformOS,
      configurable: true,
    });
  });

  it('assembles diagnostics and user profile username on Android', () => {
    Object.defineProperty(Platform, 'OS', {
      value: 'android',
      configurable: true,
    });

    const url = buildFeedbackFormUrl({
      profile: { username: 'johndoe' },
      name: 'John Doe',
      email: 'john@example.com',
    });

    expect(url).toContain('usp=pp_url');
    expect(url).toContain('entry.1086525665=johndoe');
    expect(url).toContain('entry.1534061409=2.1.0%20(42)');
    expect(url).toContain('entry.1171582430=Android%20(Pixel%208%20-%20OS%20');
  });

  it('falls back to user display name when profile username is absent', () => {
    const url = buildFeedbackFormUrl({
      name: 'Jane Smith',
      email: 'jane@example.com',
    });

    expect(url).toContain('entry.1086525665=Jane%20Smith');
  });

  it('falls back to email when name and profile username are absent', () => {
    const url = buildFeedbackFormUrl({
      email: 'alex@example.com',
    });

    expect(url).toContain('entry.1086525665=alex%40example.com');
  });

  it('handles null user gracefully', () => {
    const url = buildFeedbackFormUrl(null);
    expect(url).toContain('usp=pp_url');
    expect(url).not.toContain('entry.1086525665=');
  });
});
