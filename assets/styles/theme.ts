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
    surfaceVariant: "#F8F2F2",
    onSurfaceVariant: "#6F6262",

    outline: "#C9B3B3",
    outlineVariant: "#EFE1E1",

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
      level3: "#F8F2F2",
      level4: "#F3EAEA",
      level5: "#EFE1E1",
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

    background: "#111111",
    onBackground: "#F3EEEE",

    surface: "#1A1A1A",
    onSurface: "#F3EEEE",
    surfaceVariant: "#202020",
    onSurfaceVariant: "#E7C6C6",

    outline: "#524545",
    outlineVariant: "#2B2B2B",

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
      level1: "#151515",
      level2: "#1A1A1A",
      level3: "#202020",
      level4: "#252525",
      level5: "#2B2B2B",
    },
  },
};

export const postTokens = {
  actionColor: "#E7C6C6",
  activeActionColor: "#FFB6B6",
  imageAspectRatio: 16 / 9,
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  screen: {
    flex: 1,
  },
  feedContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  fullWidth: {
    width: "100%",
    alignSelf: "stretch",
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
  postCard: {
    width: "100%",
    alignSelf: "stretch",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: 24,
  },
  postCardShadow: {
    elevation: 4,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  },
  postTitle: {
    minHeight: 106,
    paddingHorizontal: 26,
    paddingTop: 26,
    paddingBottom: 18,
  },
  postTitleRight: {
    alignSelf: "flex-start",
    marginRight: 10,
    marginTop: 22,
  },
  postAvatar: {
    marginLeft: 0,
  },
  postBodyContent: {
    paddingHorizontal: 26,
    paddingTop: 12,
    paddingBottom: 26,
  },
  postCaptionContent: {
    paddingHorizontal: 26,
    paddingTop: 26,
    paddingBottom: 0,
  },
  postFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 26,
    paddingTop: 22,
    paddingBottom: 26,
  },
  postActionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 28,
  },
  postAction: {
    minWidth: 50,
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
  },
  postIconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  postAuthorText: {
    fontSize: 24,
    fontWeight: "800",
  },
  postTimestampText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 2,
  },
  postBodyText: {
    fontSize: 28,
    lineHeight: 42,
    fontWeight: "400",
  },
  postCaptionText: {
    fontSize: 23,
    lineHeight: 32,
    fontWeight: "600",
  },
  postActionText: {
    fontSize: 18,
    fontWeight: "800",
    marginLeft: 8,
  },
  postMedia: {
    width: "100%",
    aspectRatio: postTokens.imageAspectRatio,
    borderRadius: 0,
  },
});
