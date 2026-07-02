// theme.ts
import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { StyleSheet } from "react-native";

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#904A44",
    onPrimary: "#FFFFFF",
    primaryContainer: "#FFDAD6",
    onPrimaryContainer: "#73332E",

    secondary: "#904B40",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#FFDAD4",
    onSecondaryContainer: "#73342B",

    tertiary: "#904A46",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#FFDAD7",
    onTertiaryContainer: "#733330",

    error: "#BA1A1A",
    onError: "#FFFFFF",
    errorContainer: "#FFDAD6",
    onErrorContainer: "#93000A",

    background: "#FFF8F7",
    onBackground: "#231918",

    surface: "#FFF8F7",
    onSurface: "#231918",
    surfaceVariant: "#F5DDDB",
    onSurfaceVariant: "#534341",

    outline: "#857371",
    outlineVariant: "#D8C2BF",

    shadow: "#000000",
    scrim: "#000000",

    inverseSurface: "#392E2D",
    inverseOnSurface: "#FFEDEA",
    inversePrimary: "#FFB4AC",

    surfaceDisabled: "rgba(35, 25, 24, 0.12)",
    onSurfaceDisabled: "rgba(35, 25, 24, 0.38)",
    backdrop: "rgba(58, 45, 41, 0.4)",

    elevation: {
      level0: "transparent",
      level1: "#FFF0EF", // surfaceContainerLow
      level2: "#FCEAE8", // surfaceContainer
      level3: "#F6E4E2", // surfaceContainerHigh
      level4: "#F4E2E0", // interpolated
      level5: "#F1DEDC", // surfaceContainerHighest
    },
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#FFB4AC",
    onPrimary: "#561E1A",
    primaryContainer: "#73332E",
    onPrimaryContainer: "#FFDAD6",

    secondary: "#FFB4A8",
    onSecondary: "#561E16",
    secondaryContainer: "#73342B",
    onSecondaryContainer: "#FFDAD4",

    tertiary: "#FFB3AE",
    onTertiary: "#571E1C",
    tertiaryContainer: "#733330",
    onTertiaryContainer: "#FFDAD7",

    error: "#FFB4AB",
    onError: "#690005",
    errorContainer: "#93000A",
    onErrorContainer: "#FFDAD6",

    background: "#1A1110",
    onBackground: "#F1DEDC",

    surface: "#1A1110",
    onSurface: "#F1DEDC",
    surfaceVariant: "#534341",
    onSurfaceVariant: "#D8C2BF",

    outline: "#A08C8A",
    outlineVariant: "#534341",

    shadow: "#000000",
    scrim: "#000000",

    inverseSurface: "#F1DEDC",
    inverseOnSurface: "#392E2D",
    inversePrimary: "#904A44",

    surfaceDisabled: "rgba(241, 222, 220, 0.12)",
    onSurfaceDisabled: "rgba(241, 222, 220, 0.38)",
    backdrop: "rgba(58, 45, 41, 0.4)",

    elevation: {
      level0: "transparent",
      level1: "#231918", // surfaceContainerLow
      level2: "#271D1C", // surfaceContainer
      level3: "#322826", // surfaceContainerHigh
      level4: "#372D2B", // interpolated
      level5: "#3D3231", // surfaceContainerHighest
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