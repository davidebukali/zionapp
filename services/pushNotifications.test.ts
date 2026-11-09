import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {
  configureForegroundNotificationHandler,
  registerForPushNotificationsAsync,
} from './pushNotifications';

let mockIsDevice = true;

jest.mock('expo-device', () => ({
  __esModule: true,
  get isDevice() {
    return mockIsDevice;
  },
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      eas: {
        projectId: 'test-project-id',
      },
    },
  },
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  AndroidImportance: {
    MAX: 5,
  },
}));

describe('services/pushNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsDevice = true;
  });

  describe('configureForegroundNotificationHandler', () => {
    it('calls Notifications.setNotificationHandler', async () => {
      configureForegroundNotificationHandler();
      expect(Notifications.setNotificationHandler).toHaveBeenCalledTimes(1);

      const handlerConfig = (Notifications.setNotificationHandler as jest.Mock)
        .mock.calls[0][0];
      const result = await handlerConfig.handleNotification();
      expect(result).toEqual({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      });
    });
  });

  describe('registerForPushNotificationsAsync', () => {
    it('returns null when running on simulator / non-physical device', async () => {
      mockIsDevice = false;

      const token = await registerForPushNotificationsAsync();
      expect(token).toBeNull();
      expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled();
    });

    it('allows Android emulator in __DEV__ environment to proceed with registration', async () => {
      mockIsDevice = false;
      const originalPlatform = Platform.OS;
      Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });

      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'ExponentPushToken[mock-android-emulator-token]',
      });

      const token = await registerForPushNotificationsAsync();
      expect(token).toBe('ExponentPushToken[mock-android-emulator-token]');

      Object.defineProperty(Platform, 'OS', { value: originalPlatform, configurable: true });
    });

    it('requests permission if not initially granted and returns token', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'ExponentPushToken[mock-token-123]',
      });

      const token = await registerForPushNotificationsAsync();
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
        projectId: 'test-project-id',
      });
      expect(token).toBe('ExponentPushToken[mock-token-123]');
    });

    it('returns null if permission request is denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const token = await registerForPushNotificationsAsync();
      expect(token).toBeNull();
      expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
    });

    it('uses existing permission without requesting again if already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'ExponentPushToken[mock-token-456]',
      });

      const token = await registerForPushNotificationsAsync();
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
      expect(token).toBe('ExponentPushToken[mock-token-456]');
    });

    it('configures default notification channel on Android', async () => {
      const originalPlatform = Platform.OS;
      Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });

      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'ExponentPushToken[mock-token-android]',
      });

      await registerForPushNotificationsAsync();
      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
        'default',
        expect.objectContaining({
          name: 'Default',
          importance: 5,
          lightColor: '#DE3A3A',
        })
      );

      Object.defineProperty(Platform, 'OS', { value: originalPlatform, configurable: true });
    });

    it('handles getExpoPushTokenAsync error gracefully by returning null', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const token = await registerForPushNotificationsAsync();
      expect(token).toBeNull();
    });
  });
});
