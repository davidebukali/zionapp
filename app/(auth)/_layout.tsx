import React from "react";
import { Redirect, Stack } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

export default function AuthLayout() {
  const { isAuthenticated, isInitializing } = useSelector(
    (state: RootState) => state.auth
  );

  // If already authenticated and done initializing, redirect to tabs
  if (!isInitializing && isAuthenticated) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
}
