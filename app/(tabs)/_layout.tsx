import { globalStyles } from "../../assets/styles/theme";
import { Tabs } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';
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
  return (
    <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          header: ({ options, route }) => (
            <AppHeader title={getHeaderTitle(options, route.name)} />
          ),
          headerShadowVisible: false,
          sceneStyle: globalStyles.screen,
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
  );
}
