function getCrashlytics() {
  try {
    // Dynamically require to avoid crashing in Jest / test environments
    // where native RNFBAppModule is not linked.
    const rawModule = require('@react-native-firebase/crashlytics');
    const crashlytics = rawModule.default || rawModule;
    return typeof crashlytics === 'function' ? crashlytics() : null;
  } catch {
    return null;
  }
}

export const CrashlyticsService = {
  /**
   * Associate future crash reports and logs with the specific tester ID
   */
  setUserId: async (userId: string | number): Promise<void> => {
    try {
      const crashlytics = getCrashlytics();
      if (crashlytics) {
        await crashlytics.setUserId(String(userId));
      }
    } catch {
      // Safe fallback
    }
  },

  /**
   * Clear user attribution upon logout
   */
  clearUser: async (): Promise<void> => {
    try {
      const crashlytics = getCrashlytics();
      if (crashlytics) {
        await crashlytics.setUserId('');
      }
    } catch {
      // Safe fallback
    }
  },

  /**
   * Attach custom key-value metadata to crash reports
   */
  setAttribute: async (key: string, value: string): Promise<void> => {
    try {
      const crashlytics = getCrashlytics();
      if (crashlytics) {
        await crashlytics.setAttribute(key, String(value));
      }
    } catch {
      // Safe fallback
    }
  },

  /**
   * Record lightweight in-memory breadcrumb logs leading up to an event/crash
   */
  log: (message: string): void => {
    try {
      const crashlytics = getCrashlytics();
      if (crashlytics) {
        crashlytics.log(message);
      }
    } catch {
      // Safe fallback
    }
  },

  /**
   * Record handled / caught non-fatal exceptions
   */
  recordError: (error: unknown, jsErrorName?: string): void => {
    try {
      if (__DEV__) {
        console.warn(`[Crashlytics: ${jsErrorName || 'HandledError'}]`, error);
      }
      const crashlytics = getCrashlytics();
      if (crashlytics) {
        const resolvedError =
          error instanceof Error ? error : new Error(String(error));
        crashlytics.recordError(resolvedError, jsErrorName);
      }
    } catch {
      // Safe fallback
    }
  },
};
