import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { globalStyles } from "../../assets/styles/theme";

export type AuthScreenLayoutProps = {
  children: React.ReactNode;
  topNav?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
};

export function AuthScreenLayout({
  children,
  topNav,
  contentContainerStyle,
  backgroundColor,
}: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";

  const resolvedBg = backgroundColor || (isDark ? "#120E0E" : "#FFFFFF");

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: resolvedBg,
          paddingTop: Platform.OS === "ios" ? insets.top : 16,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor={resolvedBg}
      />

      {topNav}

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            globalStyles.authScrollContent,
            styles.scrollContent,
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
});

export default AuthScreenLayout;
