import { Appearance } from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  THEME_STORAGE_KEY,
  isThemePreference,
  loadThemePreference,
  saveThemePreference,
  applyThemePreference,
  restoreThemePreference,
} from "./utils";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

describe("features/theme/utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Appearance, "setColorScheme").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("isThemePreference", () => {
    it("returns true for valid theme preferences", () => {
      expect(isThemePreference("light")).toBe(true);
      expect(isThemePreference("dark")).toBe(true);
    });

    it("returns false for non-theme preference values", () => {
      expect(isThemePreference("system")).toBe(false);
      expect(isThemePreference("")).toBe(false);
      expect(isThemePreference(null)).toBe(false);
      expect(isThemePreference(undefined)).toBe(false);
      expect(isThemePreference(123)).toBe(false);
      expect(isThemePreference({})).toBe(false);
    });
  });

  describe("loadThemePreference", () => {
    it("returns valid theme preference from SecureStore", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce("dark");
      const result = await loadThemePreference();
      expect(result).toBe("dark");
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(THEME_STORAGE_KEY);
    });

    it("returns null when SecureStore returns null or empty", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
      const result = await loadThemePreference();
      expect(result).toBeNull();
    });

    it("returns null when SecureStore returns an invalid string", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce("invalid_mode");
      const result = await loadThemePreference();
      expect(result).toBeNull();
    });

    it("returns null when SecureStore throws an error", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error("SecureStore read failure")
      );
      const result = await loadThemePreference();
      expect(result).toBeNull();
    });
  });

  describe("saveThemePreference", () => {
    it("saves theme preference to SecureStore", async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValueOnce(undefined);
      await saveThemePreference("light");
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        THEME_STORAGE_KEY,
        "light"
      );
    });

    it("swallows SecureStore errors gracefully without throwing", async () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error("SecureStore write failure")
      );
      await expect(saveThemePreference("dark")).resolves.toBeUndefined();
    });
  });

  describe("applyThemePreference", () => {
    it("calls Appearance.setColorScheme with the specified preference", () => {
      applyThemePreference("dark");
      expect(Appearance.setColorScheme).toHaveBeenCalledWith("dark");

      applyThemePreference("light");
      expect(Appearance.setColorScheme).toHaveBeenCalledWith("light");
    });
  });

  describe("restoreThemePreference", () => {
    it("applies the saved preference when one exists", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce("dark");

      const result = await restoreThemePreference();
      expect(result).toBe("dark");
      expect(Appearance.setColorScheme).toHaveBeenCalledWith("dark");
    });

    it("does not call Appearance.setColorScheme when no preference is saved", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      const result = await restoreThemePreference();
      expect(result).toBeNull();
      expect(Appearance.setColorScheme).not.toHaveBeenCalled();
    });
  });
});

