import React from "react";
import { Redirect, Stack } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useGlobalUserChannel } from "../../hooks/useGlobalUserChannel";
import { usePushNotifications } from "../../hooks/usePushNotifications";

export default function AppGroupLayout() {
  useGlobalUserChannel();
  usePushNotifications();

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
      <Stack.Screen
        name="profile"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          presentation: "card",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="messages/[id]"
        options={{
          presentation: "card",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="posts/[postId]/index"
        options={{
          presentation: "card",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="feedback"
        options={{
          presentation: "card",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
