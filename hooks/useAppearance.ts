import { useCallback, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

import { ThemePreference } from "../features/theme/types";
import {
  applyThemePreference,
  restoreThemePreference,
  saveThemePreference,
} from "../features/theme/utils";

/**
 * Provides live appearance state and an update handler for the Appearance toggle.
 */
export function useAppearance() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const setDarkMode = useCallback((nextIsDark: boolean) => {
    const nextPreference: ThemePreference = nextIsDark ? "dark" : "light";
    applyThemePreference(nextPreference);
    void saveThemePreference(nextPreference);
  }, []);

  return {
    isDark,
    appearanceLabel: isDark ? "Dark" : "Light",
    setDarkMode,
  };
}

/**
 * Restores the saved theme preference from SecureStore once on startup.
 * Returns true when hydration is complete.
 */
export function useRestoreAppearance(): boolean {
  const [isAppearanceReady, setIsAppearanceReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    restoreThemePreference().finally(() => {
      if (isMounted) {
        setIsAppearanceReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return isAppearanceReady;
}

