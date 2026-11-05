import { Appearance } from "react-native";
import * as SecureStore from "expo-secure-store";
import { ThemePreference } from "./types";

export const THEME_STORAGE_KEY = "zion_theme_mode";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark";
}

export async function loadThemePreference(): Promise<ThemePreference | null> {
  try {
    const storedValue = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
    return isThemePreference(storedValue) ? storedValue : null;
  } catch {
    return null;
  }
}

export async function saveThemePreference(preference: ThemePreference): Promise<void> {
  try {
    await SecureStore.setItemAsync(THEME_STORAGE_KEY, preference);
  } catch {
    // Theme is already applied in-memory; ignore persistence failures gracefully
  }
}

export function applyThemePreference(preference: ThemePreference): void {
  Appearance.setColorScheme(preference);
}

/**
 * Loads the saved user theme preference and applies it immediately.
 * If no preference has been saved yet, leaves system theme untouched.
 */
export async function restoreThemePreference(): Promise<ThemePreference | null> {
  const savedPreference = await loadThemePreference();
  if (savedPreference) {
    applyThemePreference(savedPreference);
  }
  return savedPreference;
}

