import React from "react";
import { Alert, StyleSheet, View, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import { useDispatch } from "react-redux";
import { LoginForm } from "../../components/Auth";
import { loginUser } from "../../features/auth/authSlice";
import { AppDispatch } from "../../store/store";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";

  const handleSignIn = async (email: string) => {
    // Simulate sign-in process
    await new Promise((resolve) => setTimeout(resolve, 800));
    await dispatch(
      loginUser({
        token: "mock_jwt_token_" + Date.now(),
        user: {
          id: "1",
          email,
          name: email.split("@")[0] || "User",
        },
      })
    );
    router.replace("/(app)/(tabs)");
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
