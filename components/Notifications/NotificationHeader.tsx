import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';

import { NotificationHeaderProps } from './types';

export function NotificationHeader({
  onBack,
  title = 'Activity',
}: NotificationHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: theme.colors.background,
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginLeft: -4,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});

