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

  return <Stack screenOptions={{ headerShown: false }} />;
}
