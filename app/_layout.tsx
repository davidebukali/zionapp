import React, { useEffect, useMemo } from "react";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Provider, useDispatch, useSelector } from "react-redux";

import { darkTheme, lightTheme } from "../assets/styles/theme";
import { store, RootState, AppDispatch } from "../store/store";
import { restoreSession } from "../features/auth/authSlice";
import { GlobalOfflineBanner } from "../components/Common/GlobalOfflineBanner";
import { useRestoreAppearance } from "../hooks/useAppearance";

// Prevent splash screen from auto-hiding while restoring session
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigation() {
  const dispatch = useDispatch<AppDispatch>();
  const isInitializing = useSelector(
    (state: RootState) => state.auth.isInitializing
  );
  const isAppearanceReady = useRestoreAppearance();
  const isAppReady = !isInitializing && isAppearanceReady;

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isAppReady]);

  if (!isAppReady) {
    return null;
  }

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  // Synchronize React Navigation theme with the active color scheme so stack transitions
  // and card canvas backgrounds match the dark palette without flashing white.
  const navigationTheme = useMemo(
    () => ({
      ...(colorScheme === "dark" ? DarkTheme : DefaultTheme),
      colors: {
        ...(colorScheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
        background: theme.colors.background,
        card: theme.colors.surface,
      },
    }),
    [colorScheme, theme.colors.background, theme.colors.surface]
  );

  // Synchronize native window background (iOS UIWindow / Android windowBackground)
  // to prevent the native window from flashing white during screen transitions and swipe-back gestures.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background).catch(() => {});
  }, [theme.colors.background]);

  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
        <ThemeProvider value={navigationTheme}>
          <StatusBar
            style={colorScheme === "dark" ? "light" : "dark"}
            backgroundColor={theme.colors.background}
          />
          <GlobalOfflineBanner />
          <RootNavigation />
        </ThemeProvider>
      </PaperProvider>
    </Provider>
  );
}
