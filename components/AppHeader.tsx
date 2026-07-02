import { Image, StyleSheet, Text, View, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";

type AppHeaderProps = {
  title: string;
};

const appIcon = require("../assets/images/icon.png");

export function AppHeader({ title }: AppHeaderProps) {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.outlineVariant,
          paddingTop: insets.top,
          height: insets.top + 56,
        },
      ]}
    >
      <StatusBar
        backgroundColor={theme.colors.surface}
        style={colorScheme === "dark" ? "light" : "dark"}
      />

      <View style={styles.content}>
        <Image source={appIcon} style={styles.icon} />
        <Text
          numberOfLines={1}
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
  },
});
