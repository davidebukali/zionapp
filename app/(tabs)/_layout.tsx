import { PaperProvider } from 'react-native-paper';
import { lightTheme, darkTheme } from "../../assets/styles/theme";
import { useColorScheme } from 'react-native';
import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <MaterialIcons size={28} name="house" color={color} />,
          }}
        />
        <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
        <Tabs.Screen name="add" options={{ title: '' }} />
        <Tabs.Screen name="notifications" options={{ title: 'Alerts' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>
    </PaperProvider>
  );
}



