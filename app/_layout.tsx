import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";
import { Provider } from "react-redux";

import { darkTheme, lightTheme } from "../assets/styles/theme";
import { store } from "../store/store";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="posts/[postId]/comments" />
        </Stack>
      </PaperProvider>
    </Provider>
  );
}
