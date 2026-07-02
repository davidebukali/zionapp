// theme.ts
import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { StyleSheet } from "react-native";

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#DE3A3A",
    onPrimary: "#FFFFFF",
    primaryContainer: "#FDE8E8",
    onPrimaryContainer: "#8F1F1F",

    secondary: "#DE3A3A",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#FDE8E8",
    onSecondaryContainer: "#8F1F1F",

    tertiary: "#DE3A3A",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#FDE8E8",
    onTertiaryContainer: "#8F1F1F",

    error: "#BA1A1A",
    onError: "#FFFFFF",
    errorContainer: "#FFDAD6",
    onErrorContainer: "#93000A",

    background: "#FFFFFF",
    onBackground: "#111111",

    surface: "#FFFFFF",
    onSurface: "#111111",
    surfaceVariant: "#F7F7F8",
    onSurfaceVariant: "#8E8E93",

    outline: "#8E8E93",
    outlineVariant: "#E5E5EA",

    shadow: "#000000",
    scrim: "#000000",

    inverseSurface: "#121212",
    inverseOnSurface: "#FFFFFF",
    inversePrimary: "#FF7A7A",

    surfaceDisabled: "rgba(17, 17, 17, 0.12)",
    onSurfaceDisabled: "rgba(17, 17, 17, 0.38)",
    backdrop: "rgba(18, 18, 18, 0.4)",

    elevation: {
      level0: "transparent",
      level1: "#FFFFFF",
      level2: "#FFFFFF",
      level3: "#F7F7F8",
      level4: "#F2F2F7",
      level5: "#E5E5EA",
    },
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#DE3A3A",
    onPrimary: "#FFFFFF",
    primaryContainer: "#4A1717",
    onPrimaryContainer: "#FFDCDC",

    secondary: "#DE3A3A",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#4A1717",
    onSecondaryContainer: "#FFDCDC",

    tertiary: "#DE3A3A",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#4A1717",
    onTertiaryContainer: "#FFDCDC",

    error: "#FFB4AB",
    onError: "#690005",
    errorContainer: "#93000A",
    onErrorContainer: "#FFDAD6",

    background: "#121212",
    onBackground: "#FFFFFF",

    surface: "#121212",
    onSurface: "#FFFFFF",
    surfaceVariant: "#1C1C1E",
    onSurfaceVariant: "#8A8A8A",

    outline: "#8A8A8A",
    outlineVariant: "#262626",

    shadow: "#000000",
    scrim: "#000000",

    inverseSurface: "#FFFFFF",
    inverseOnSurface: "#121212",
    inversePrimary: "#DE3A3A",

    surfaceDisabled: "rgba(255, 255, 255, 0.12)",
    onSurfaceDisabled: "rgba(255, 255, 255, 0.38)",
    backdrop: "rgba(0, 0, 0, 0.4)",

    elevation: {
      level0: "transparent",
      level1: "#121212",
      level2: "#121212",
      level3: "#1C1C1E",
      level4: "#202022",
      level5: "#262626",
    },
  },
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  buttonFull: {
    width: "100%",
    marginVertical: 8,
  },
  buttonHalf: {
    width: "48%",
    marginVertical: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
});
