import React from "react";
import { CommonActions } from "@react-navigation/native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function CustomTabBar({ state, descriptors, navigation }: any) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const activeColor = theme.colors.primary;
  const inactiveColor = theme.colors.onSurfaceVariant;
  const backgroundColor = theme.colors.surface;
  const borderColor = theme.colors.outlineVariant;

  const renderTabButton = (route: any, index: number) => {
    const isFocused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.dispatch({
          ...CommonActions.navigate(route.name, route.params),
          target: state.key,
        });
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: 'tabLongPress',
        target: route.key,
      });
    };

    let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
    let label = 'Home';

    if (route.name === 'index') {
      iconName = isFocused ? 'home' : 'home-outline';
      label = 'Home';
    } else if (route.name === 'discover') {
      iconName = isFocused ? 'search' : 'search-outline';
      label = 'Discover';
    } else if (route.name === 'messages') {
      iconName = isFocused ? 'paper-plane' : 'paper-plane-outline';
      label = 'Messages';
    } else if (route.name === 'settings') {
      iconName = isFocused ? 'person' : 'person-outline';
      label = 'Me';
    }

    const color = isFocused ? activeColor : inactiveColor;

    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.tabButton}
        activeOpacity={0.7}
      >
        <Ionicons name={iconName} size={28} color={color} />
      </TouchableOpacity>
    );
  };

  const renderAddButton = () => (
    <TouchableOpacity
      key="custom-add-button"
      accessibilityRole="button"
      accessibilityLabel="Create post"
      onPress={() => router.push('/new-post')}
      style={styles.addButtonContainer}
      activeOpacity={0.8}
    >
      <View style={[styles.addButton, { backgroundColor: activeColor, shadowColor: activeColor }]}>
        <Ionicons name="add" size={32} color={theme.colors.onPrimary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor,
          borderTopColor: borderColor,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => (
        <React.Fragment key={route.key}>
          {index === 2 && renderAddButton()}
          {renderTabButton(route, index)}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 8,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  addButtonContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    top: -16, // floats above the bar
    elevation: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
});
