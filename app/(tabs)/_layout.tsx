import { PaperProvider } from 'react-native-paper';
import { lightTheme, darkTheme } from "../../assets/styles/theme";
import { useColorScheme, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';
import { Provider } from 'react-redux'
import { store } from '../../store/store'
import { CustomTabBar } from '../../components/CustomTabBar';

function getHeaderTitle(options: { title?: string; headerTitle?: unknown }, routeName: string) {
  if (typeof options.title === "string") {
    return options.title;
  }

  if (typeof options.headerTitle === "string") {
    return options.headerTitle;
  }

  return routeName;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          header: ({ options, route }) => (
            <AppHeader title={getHeaderTitle(options, route.name)} />
          ),
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Discover',
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: 'Add',
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Alerts',
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
          }}
        />
      </Tabs>
    </PaperProvider>
    </Provider>
  );
}
