import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { TouchableOpacity, Text } from 'react-native';
import { FeedbackHeader } from './FeedbackHeader';

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');
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
        outlineVariant: '#E5E5E5',
      },
    }),
  };
});

describe('FeedbackHeader', () => {
  it('renders default title "Feedback"', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<FeedbackHeader onBack={jest.fn()} />);
    });

    const textNodes = renderer!.root.findAllByType(Text);
    const hasFeedbackTitle = textNodes.some(
      (node) => node.props.children === 'Feedback'
    );
    expect(hasFeedbackTitle).toBe(true);
  });

  it('renders custom title when provided', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <FeedbackHeader onBack={jest.fn()} title="Beta Feedback" />
      );
    });

    const textNodes = renderer!.root.findAllByType(Text);
    const hasCustomTitle = textNodes.some(
      (node) => node.props.children === 'Beta Feedback'
    );
    expect(hasCustomTitle).toBe(true);
  });

  it('calls onBack when back button is pressed', () => {
    const onBackMock = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<FeedbackHeader onBack={onBackMock} />);
    });

    const touchables = renderer!.root.findAllByType(TouchableOpacity);
    const backButton = touchables.find(
      (t) => t.props.accessibilityLabel === 'Go back'
    );
    expect(backButton).toBeDefined();

    act(() => {
      backButton!.props.onPress();
    });

    expect(onBackMock).toHaveBeenCalledTimes(1);
  });
});
