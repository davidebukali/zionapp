import { CommonActions } from "@react-navigation/native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { darkTheme, lightTheme } from "../assets/styles/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function CustomTabBar({ state, descriptors, navigation }: any) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  const activeColor = theme.colors.primary;
  const inactiveColor = theme.colors.onSurfaceVariant;
  const backgroundColor = theme.colors.surface;
  const borderColor = theme.colors.outlineVariant;

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
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
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

        if (route.name === 'add') {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.addButtonContainer}
              activeOpacity={0.8}
            >
              <View style={[styles.addButton, { backgroundColor: activeColor, shadowColor: activeColor }]}>
                <Ionicons name="add" size={32} color={theme.colors.onPrimary} />
              </View>
            </TouchableOpacity>
          );
        }

        let iconName: any = 'home-outline';
        let label = 'Home';

        if (route.name === 'index') {
          iconName = isFocused ? 'home' : 'home-outline';
          label = 'Home';
        } else if (route.name === 'discover') {
          iconName = isFocused ? 'search' : 'search-outline';
          label = 'Discover';
        } else if (route.name === 'notifications') {
          iconName = isFocused ? 'notifications' : 'notifications-outline';
          label = 'Alerts';
        } else if (route.name === 'settings') {
          iconName = isFocused ? 'person' : 'person-outline';
          label = 'Me';
        }

        const color = isFocused ? activeColor : inactiveColor;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <Ionicons name={iconName} size={24} color={color} />
            <Text style={[styles.tabLabel, { color }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 8,
    shadowColor: '#000000',
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
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
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
    // Shadow / Glow
    elevation: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
});
