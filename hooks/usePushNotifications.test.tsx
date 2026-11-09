import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';

import { usePushNotifications } from './usePushNotifications';
import { registerForPushNotificationsAsync } from '../services/pushNotifications';

const mockRegisterTrigger = jest.fn();
let mockIsAuthenticated = true;
let mockToken: string | null = 'test-auth-token';

jest.mock('react-redux', () => ({
  useSelector: (selector: (state: any) => any) =>
    selector({
      auth: {
        isAuthenticated: mockIsAuthenticated,
        token: mockToken,
      },
    }),
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('expo-device', () => ({
  modelName: 'iPhone 15',
}));

jest.mock('../services/pushNotifications', () => ({
  registerForPushNotificationsAsync: jest.fn(),
}));

let mockForegroundCallback: ((notification: any) => void) | null = null;
let mockResponseCallback: ((response: any) => void) | null = null;
const mockForegroundRemove = jest.fn();
const mockResponseRemove = jest.fn();

jest.mock('expo-notifications', () => ({
  addNotificationReceivedListener: jest.fn((callback) => {
    mockForegroundCallback = callback;
    return { remove: mockForegroundRemove };
  }),
  addNotificationResponseReceivedListener: jest.fn((callback) => {
    mockResponseCallback = callback;
    return { remove: mockResponseRemove };
  }),
}));

jest.mock('../features/notifications/api', () => ({
  useRegisterPushTokenMutation: () => [mockRegisterTrigger],
}));

function TestHookConsumer() {
  usePushNotifications();
  return null;
}

describe('hooks/usePushNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAuthenticated = true;
    mockToken = 'test-auth-token';
    mockRegisterTrigger.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue(undefined),
    });
  });

  it('registers token and syncs with backend when authenticated', async () => {
    (registerForPushNotificationsAsync as jest.Mock).mockResolvedValue(
      'ExponentPushToken[mock-push-token]'
    );

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<TestHookConsumer />);
    });

    expect(registerForPushNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(mockRegisterTrigger).toHaveBeenCalledWith({
      token: 'ExponentPushToken[mock-push-token]',
      platform: expect.any(String),
      device_name: 'iPhone 15',
    });
  });

  it('does not register if unauthenticated', async () => {
    mockIsAuthenticated = false;
    mockToken = null;

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<TestHookConsumer />);
    });

    expect(registerForPushNotificationsAsync).not.toHaveBeenCalled();
    expect(mockRegisterTrigger).not.toHaveBeenCalled();
  });

  it('cleans up notification subscriptions on unmount', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<TestHookConsumer />);
    });

    act(() => {
      renderer!.unmount();
    });

    expect(mockForegroundRemove).toHaveBeenCalledTimes(1);
    expect(mockResponseRemove).toHaveBeenCalledTimes(1);
  });

  describe('deep linking interactions', () => {
    it('navigates to post when notification payload has postId', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<TestHookConsumer />);
      });

      expect(mockResponseCallback).not.toBeNull();
      act(() => {
        mockResponseCallback!({
          notification: {
            request: {
              content: {
                data: { postId: 'post-123' },
              },
            },
          },
        });
      });

      expect(router.push).toHaveBeenCalledWith('/posts/post-123');
    });

    it('navigates to user profile when notification payload has userId', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<TestHookConsumer />);
      });

      act(() => {
        mockResponseCallback!({
          notification: {
            request: {
              content: {
                data: { userId: 'user-456' },
              },
            },
          },
        });
      });

      expect(router.push).toHaveBeenCalledWith({
        pathname: '/profile',
        params: { userId: 'user-456' },
      });
    });

    it('navigates to notifications screen when payload has no post or user ID', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<TestHookConsumer />);
      });

      act(() => {
        mockResponseCallback!({
          notification: {
            request: {
              content: {
                data: {},
              },
            },
          },
        });
      });

      expect(router.push).toHaveBeenCalledWith('/notifications');
    });
  });
});

