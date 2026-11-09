import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

/**
 * Configures the foreground notification presentation behavior.
 * When a notification arrives while the app is active, it will show an alert,
 * play sound, and update the badge count.
 */
export function configureForegroundNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Requests notification permissions, creates Android channels if necessary,
 * and fetches the Expo Push Token for this device.
 */
export async function registerForPushNotificationsAsync(options?: {
  projectId?: string;
}): Promise<string | null> {
  // Enforce physical devices in production; allow Android emulators during development
  if (!Device.isDevice && (!__DEV__ || Platform.OS !== 'android')) {
    console.warn('[PushNotifications] Push notifications require a physical device.');
    return null;
  }

  // Configure Android high-importance notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#DE3A3A',
    });
  }

  // Check current permission status
  const existingPermissions = await Notifications.getPermissionsAsync();
  let finalStatus = existingPermissions?.status;

  // Request if not already granted
  if (existingPermissions?.status !== 'granted') {
    const requestedPermissions = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermissions?.status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[PushNotifications] Push notification permission not granted:', finalStatus);
    return null;
  }

  // Resolve EAS project ID
  const projectId =
    options?.projectId ||
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId;

  try {
    const tokenResult = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    return tokenResult.data;
  } catch (tokenError) {
    console.warn('[PushNotifications] Failed to retrieve Expo push token:', tokenError);
    return null;
  }
}
