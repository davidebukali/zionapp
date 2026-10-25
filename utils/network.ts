import { useEffect, useState } from "react";
import { NativeModules, Platform } from "react-native";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

// Safely resolve NetInfo without throwing when running in an unlinked dev client or Expo Go
let NetInfoModule: any = null;
if (NativeModules && NativeModules.RNCNetInfo) {
  try {
    const imported = require("@react-native-community/netinfo");
    NetInfoModule = imported.default || imported;
  } catch {
    NetInfoModule = null;
  }
}

/**
 * Imperative function to check if device is currently online with reachable internet.
 * Safe in all environments (native linked, unlinked, web, tests).
 */
export async function checkIsOnline(): Promise<boolean> {
  if (NetInfoModule?.fetch) {
    try {
      const state = await NetInfoModule.fetch();
      return Boolean(state.isConnected && state.isInternetReachable !== false);
    } catch {
      // Fall through to fallback check
    }
  }

  // Web fallback
  if (Platform.OS === "web" && typeof navigator !== "undefined") {
    return navigator.onLine;
  }

  // Lightweight network connectivity check fallback
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://clients3.google.com/generate_204", {
      method: "HEAD",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.status === 204 || res.ok;
  } catch {
    return false;
  }
}

/**
 * Reactive hook that listens to live network state changes.
 * Degrades gracefully if native module is not yet compiled into the current binary.
 */
export function useNetworkStatus() {
  const [status, setStatus] = useState<{
    isOnline: boolean;
    isInternetReachable: boolean | null;
  }>({
    isOnline: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    // 1. If native NetInfo is available, use real-time OS event listeners
    if (NetInfoModule?.fetch && NetInfoModule?.addEventListener) {
      NetInfoModule.fetch().then((state: any) => {
        setStatus({
          isOnline: Boolean(state.isConnected && state.isInternetReachable !== false),
          isInternetReachable: state.isInternetReachable ?? null,
        });
      });

      const unsubscribe = NetInfoModule.addEventListener((state: any) => {
        setStatus({
          isOnline: Boolean(state.isConnected && state.isInternetReachable !== false),
          isInternetReachable: state.isInternetReachable ?? null,
        });
      });

      return unsubscribe;
    }

    // 2. If running on Web, use browser online/offline events
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const updateWebStatus = () => {
        setStatus({
          isOnline: navigator.onLine,
          isInternetReachable: navigator.onLine,
        });
      };

      window.addEventListener("online", updateWebStatus);
      window.addEventListener("offline", updateWebStatus);
      updateWebStatus();

      return () => {
        window.removeEventListener("online", updateWebStatus);
        window.removeEventListener("offline", updateWebStatus);
      };
    }

    // 3. Fallback: Check initially once
    checkIsOnline().then((online) => {
      setStatus({ isOnline: online, isInternetReachable: online });
    });
  }, []);

  return status;
}

/**
 * Detects if an error is caused by a network outage / unreachable connection.
 */
export function isNetworkError(
  error: FetchBaseQueryError | SerializedError | unknown
): boolean {
  if (!error) return false;
  if (typeof error === "object" && error !== null) {
    if ("status" in error && (error as FetchBaseQueryError).status === "FETCH_ERROR") {
      return true;
    }
    if (
      "message" in error &&
      typeof (error as Error).message === "string" &&
      ((error as Error).message.includes("Network request failed") ||
        (error as Error).message.includes("network"))
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Detects if an error is a 5xx Server Error.
 */
export function isServerError(
  error: FetchBaseQueryError | SerializedError | unknown
): boolean {
  if (!error || typeof error !== "object") return false;
  if ("status" in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === "number" && status >= 500;
  }
  return false;
}

/**
 * Formats a user-friendly error message from RTK Query / JS errors.
 */
export function getErrorMessage(
  error: FetchBaseQueryError | SerializedError | unknown
): string {
  if (!error) return "An unexpected error occurred.";

  if (isNetworkError(error)) {
    return "Unable to connect to the internet. Please check your connection.";
  }

  if (isServerError(error)) {
    return "Our servers are experiencing technical issues. Please try again soon.";
  }

  if (typeof error === "object" && error !== null) {
    if ("data" in error && (error as any).data?.message) {
      return (error as any).data.message;
    }
    if ("error" in error && typeof (error as any).error === "string") {
      return (error as any).error;
    }
    if ("message" in error && typeof (error as any).message === "string") {
      return (error as any).message;
    }
  }

  return "Something went wrong while loading content.";
}
