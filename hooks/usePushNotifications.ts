import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import type { RootState } from '../store/store';
import { useRegisterPushTokenMutation } from '../features/notifications/api';
import { PushNotificationPayloadData } from '../features/notifications/types';
import { registerForPushNotificationsAsync } from '../services/pushNotifications';

/**
 * Custom hook to register device push notifications upon login,
 * synchronize the push token with the backend, listen for foreground alerts,
 * and handle tap deep linking.
 */
export function usePushNotifications() {
  const token = useSelector((state: RootState) => state.auth.token);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const [registerPushTokenTrigger] = useRegisterPushTokenMutation();
  const hasRegisteredRef = useRef(false);

  // 1. Register push token and synchronize with backend
  useEffect(() => {
    if (!isAuthenticated || !token || hasRegisteredRef.current) {
      return;
    }

    let isMounted = true;

    async function setupPushNotifications() {
      try {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken && isMounted) {
          hasRegisteredRef.current = true;
          const currentPlatform =
            Platform.OS === 'ios'
              ? 'ios'
              : Platform.OS === 'android'
              ? 'android'
              : 'web';

          await registerPushTokenTrigger({
            token: pushToken,
            platform: currentPlatform,
            device_name: Device.modelName || undefined,
          }).unwrap();
        }
      } catch (registrationError) {
        console.warn(
          '[usePushNotifications] Push registration or backend sync error:',
          registrationError
        );
      }
    }

    setupPushNotifications();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, token, registerPushTokenTrigger]);

  // 2. Setup incoming and interaction listeners
  useEffect(() => {
    // Listener for foreground notifications
    const foregroundSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        // Can be used to log or update local state when notification is received while foregrounded
        if (__DEV__) {
          console.log(
            '[usePushNotifications] Foreground notification received:',
            notification.request.content.title
          );
        }
      });

    // Listener for user interactions (tapping a push notification)
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const payloadData = response.notification.request.content
          .data as PushNotificationPayloadData | undefined;

        const targetPostId = payloadData?.postId || payloadData?.post_id;
        const targetUserId = payloadData?.userId || payloadData?.user_id;

        if (targetPostId) {
          router.push(`/posts/${targetPostId}`);
        } else if (targetUserId) {
          router.push({
            pathname: '/profile',
            params: { userId: targetUserId },
          });
        } else {
          router.push('/notifications');
        }
      });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);
}

