import React from "react";
import { Alert, StyleSheet, View, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import { LoginForm } from "../components/Auth";

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";

  const handleSignIn = async (email: string) => {
    // Simulate sign-in process
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Navigate to main tabs screen
    router.replace("/(tabs)");
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Reset Password",
      "A password reset link has been sent to your email address."
    );
  };

  const handleCreateAccount = () => {
    router.push("/register");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? theme.colors.background : "#FFFFFF",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <LoginForm
        onSignIn={handleSignIn}
        onForgotPassword={handleForgotPassword}
        onCreateAccount={handleCreateAccount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
