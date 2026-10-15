import React, { useEffect } from "react";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { Provider, useDispatch, useSelector } from "react-redux";

import { darkTheme, lightTheme } from "../assets/styles/theme";
import { store, RootState, AppDispatch } from "../store/store";
import { restoreSession } from "../features/auth/authSlice";

// Prevent splash screen from auto-hiding while restoring session
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigation() {
  const dispatch = useDispatch<AppDispatch>();
  const isInitializing = useSelector(
    (state: RootState) => state.auth.isInitializing
  );

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    if (!isInitializing) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isInitializing]);

  if (isInitializing) {
    return null;
  }

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
        <StatusBar
          style={colorScheme === "dark" ? "light" : "dark"}
          backgroundColor={theme.colors.background}
        />
        <RootNavigation />
      </PaperProvider>
    </Provider>
  );
}
