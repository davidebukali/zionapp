import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface FeedbackHeaderProps {
  onBack: () => void;
  title?: string;
}

export function FeedbackHeader({
  onBack,
  title = 'Feedback',
}: FeedbackHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.outlineVariant,
          paddingTop: insets.top + 6,
        },
      ]}
    >
      <StatusBar
        backgroundColor={theme.colors.background}
        style={theme.dark ? 'light' : 'dark'}
      />
      <View style={styles.headerRow}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={onBack}
          style={styles.backButton}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color={theme.colors.onBackground}
          />
        </TouchableOpacity>

        <Text
          numberOfLines={1}
          style={[
            styles.titleText,
            { color: theme.colors.onBackground },
          ]}
        >
          {title}
        </Text>

        <View style={styles.rightPlaceholder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  rightPlaceholder: {
    width: 36,
  },
});

