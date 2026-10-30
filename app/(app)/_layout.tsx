import React from "react";
import { Redirect, Stack } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

export default function AppGroupLayout() {
  const { isAuthenticated, isInitializing } = useSelector(
    (state: RootState) => state.auth
  );

  // If unauthenticated and done initializing, redirect to login
  if (!isInitializing && !isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="new-post"
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          presentation: "card",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
