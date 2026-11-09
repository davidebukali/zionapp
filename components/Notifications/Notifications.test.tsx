import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { TouchableOpacity, Text } from 'react-native';

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));
jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  return {
    ...actual,
    useTheme: () => ({
      dark: false,
      colors: {
        background: '#FFFFFF',
        onBackground: '#111111',
        surface: '#FFFFFF',
        onSurface: '#111111',
        surfaceVariant: '#F3EEEE',
        onSurfaceVariant: '#6F6262',
        outline: '#C9B3B3',
        outlineVariant: '#EFE1E1',
        primary: '#DE3A3A',
        primaryContainer: '#FDE8E8',
      },
    }),
  };
});

import { NotificationHeader } from './NotificationHeader';
import { NotificationTabs } from './NotificationTabs';
import { NotificationSectionHeader } from './NotificationSectionHeader';
import { NotificationActionButton } from './NotificationActionButton';
import { NotificationAvatarBadge } from './NotificationAvatarBadge';
import { NotificationItem } from './NotificationItem';
import { NotificationsList } from './NotificationsList';
import {
  NotificationItem as NotificationItemType,
  NotificationSection,
} from '../../features/notifications/types';

const mockNotification: NotificationItemType = {
  id: 'notif-1',
  user_id: 'user-1',
  actor_id: 'actor-1',
  actor: {
    id: 'actor-1',
    name: 'Maya Chen',
    email: 'maya@example.com',
    is_following: false,
    profile: {
      id: 'profile-1',
      user_id: 'actor-1',
      username: 'mayachen',
      display_name: 'Maya Chen',
      is_private: false,
    },
  },
  type: 'user_followed',
  notifiable_type: 'User',
  notifiable_id: 'user-1',
  data: {
    actor_name: 'Maya Chen',
  },
  read_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('Notifications components', () => {
  describe('NotificationHeader', () => {
    it('renders the Activity title and handles back press', () => {
      const onBackMock = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;

      act(() => {
        renderer = ReactTestRenderer.create(
          <NotificationHeader onBack={onBackMock} />
        );
      });

      const title = renderer!.root.findByProps({ children: 'Activity' });
      expect(title).toBeDefined();

      const backButton = renderer!.root.findByProps({
        accessibilityLabel: 'Go back',
      });
      act(() => {
        backButton.props.onPress();
      });
      expect(onBackMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('NotificationTabs', () => {
    it('renders All and Mentions tabs and calls onSelectTab', () => {
      const onSelectTabMock = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;

      act(() => {
        renderer = ReactTestRenderer.create(
          <NotificationTabs
            activeTab="all"
            onSelectTab={onSelectTabMock}
          />
        );
      });

      const mentionsTab = renderer!.root.findByProps({
        accessibilityLabel: 'Mentions tab',
      });
      act(() => {
        mentionsTab.props.onPress();
      });
      expect(onSelectTabMock).toHaveBeenCalledWith('mentions');
    });
  });

  describe('NotificationSectionHeader', () => {
    it('renders section title without Mark all read by default', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <NotificationSectionHeader title="Today" />
        );
      });

      expect(
        renderer!.root.findByProps({ children: 'Today' })
      ).toBeDefined();
      expect(
        renderer!.root.findAllByProps({
          accessibilityLabel: 'Mark all as read',
        })
      ).toHaveLength(0);
    });

    it('renders Mark all read and handles press when enabled', () => {
      const onMarkAllMock = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <NotificationSectionHeader
            title="Today"
            showMarkAllRead={true}
            onMarkAllRead={onMarkAllMock}
          />
        );
      });

      const markAllButton = renderer!.root.findByProps({
        accessibilityLabel: 'Mark all as read',
      });
      act(() => {
        markAllButton.props.onPress();
      });
      expect(onMarkAllMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('NotificationActionButton', () => {
    it('renders Follow back when isFollowing is false', () => {
      const onPressMock = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <NotificationActionButton
            isFollowing={false}
            onPress={onPressMock}
          />
        );
      });

      expect(
        renderer!.root.findByProps({ children: 'Follow back' })
      ).toBeDefined();

      const button = renderer!.root.findByProps({
        accessibilityLabel: 'Follow back',
      });
      act(() => {
        button.props.onPress();
      });
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('renders Following when isFollowing is true', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <NotificationActionButton isFollowing={true} onPress={jest.fn()} />
        );
      });

      expect(
        renderer!.root.findByProps({ children: 'Following' })
      ).toBeDefined();
    });
  });

  describe('NotificationAvatarBadge', () => {
    it('renders avatar initials fallback and type badge', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <NotificationAvatarBadge
            actor={mockNotification.actor}
            type="user_followed"
          />
        );
      });

      expect(renderer!.root.findByProps({ children: 'MC' })).toBeDefined();
    });
  });

  describe('NotificationItem', () => {
    it('renders actor, description, and triggers callbacks', () => {
      const onPressMock = jest.fn();
      const onActorPressMock = jest.fn();
      const onFollowToggleMock = jest.fn();

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <NotificationItem
            notification={mockNotification}
            onPress={onPressMock}
            onPressActor={onActorPressMock}
            onToggleFollowBack={onFollowToggleMock}
          />
        );
      });

      // Tap whole row
      const row = renderer!.root.findByProps({
        accessibilityLabel: 'Maya Chen started following you',
      });
      act(() => {
        row.props.onPress();
      });
      expect(onPressMock).toHaveBeenCalledWith(mockNotification);

      // Tap actor name
      const actorText = renderer!.root.findByProps({ children: 'Maya Chen' });
      act(() => {
        actorText.props.onPress();
      });
      expect(onActorPressMock).toHaveBeenCalledWith(mockNotification);

      // Tap follow button
      const followButton = renderer!.root.findByProps({
        accessibilityLabel: 'Follow back',
      });
      act(() => {
        followButton.props.onPress();
      });
      expect(onFollowToggleMock).toHaveBeenCalledWith(mockNotification);
    });

    it('renders comment quote snippet when present', () => {
      const commentNotification: NotificationItemType = {
        ...mockNotification,
        type: 'post_commented',
        data: {
          comment_content: 'this is exactly the vibe',
        },
      };

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <NotificationItem
            notification={commentNotification}
            onPress={jest.fn()}
          />
        );
      });

      expect(
        renderer!.root.findByProps({ children: '“this is exactly the vibe”' })
      ).toBeDefined();
    });
  });

  describe('NotificationsList', () => {
    it('renders empty state when sections is empty and not loading', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <NotificationsList
            sections={[]}
            activeTab="all"
            hasUnreadNotifications={false}
            isLoading={false}
            isRefreshing={false}
            isLoadingMore={false}
            isMarkingAllRead={false}
            onRefresh={jest.fn()}
            onLoadMore={jest.fn()}
            onMarkAllRead={jest.fn()}
            onPressNotification={jest.fn()}
          />
        );
      });

      expect(
        renderer!.root.findByProps({ children: 'No activity yet' })
      ).toBeDefined();
    });

    it('renders sections with items and header', () => {
      const sections: NotificationSection[] = [
        {
          title: 'Today',
          data: [mockNotification],
        },
      ];

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <NotificationsList
            sections={sections}
            activeTab="all"
            hasUnreadNotifications={true}
            isLoading={false}
            isRefreshing={false}
            isLoadingMore={false}
            isMarkingAllRead={false}
            onRefresh={jest.fn()}
            onLoadMore={jest.fn()}
            onMarkAllRead={jest.fn()}
            onPressNotification={jest.fn()}
          />
        );
      });

      expect(
        renderer!.root.findByProps({ children: 'Today' })
      ).toBeDefined();
      expect(
        renderer!.root.findByProps({ children: 'Mark all read' })
      ).toBeDefined();
      expect(
        renderer!.root.findByProps({ children: 'Maya Chen' })
      ).toBeDefined();
    });
  });
});

