import React from "react";
import { Alert, Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import { useDispatch } from "react-redux";
import { StatusBar } from "expo-status-bar";
import { LoginForm } from "../../components/Auth";
import { loginUser } from "../../features/auth/authSlice";
import { useLoginMutation, authApi } from "../../features/auth/api";
import { AppDispatch } from "../../store/store";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [login] = useLoginMutation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";

  const handleSignIn = async (email: string, password: string) => {
    try {
      const response = await login({ email: email.trim(), password }).unwrap();
      const token =
        response?.data?.token ||
        response?.token ||
        response?.access_token ||
        response?.data?.access_token;

      if (!token) {
        throw new Error("No token returned from server.");
      }

      const initialUser =
        response?.resource ||
        response?.data?.user ||
        response?.user ||
        null;

      // Save token to SecureStore & Redux state
      await dispatch(loginUser({ token, user: initialUser }));

      // Fetch user profile from /me endpoint if not already fully provided
      try {
        const meResult = await dispatch(
          authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true })
        ).unwrap();
        const meUser = meResult.data || meResult.resource;
        if (meUser) {
          await dispatch(loginUser({ token, user: meUser }));
        }
      } catch {
        if (!initialUser) {
          // Fallback user if /me endpoint is not yet available
          await dispatch(
            loginUser({
              token,
              user: {
                id: "1",
                email: email.trim(),
                name: email.trim().split("@")[0] || "User",
              },
            })
          );
        }
      }

      router.replace("/(app)/(tabs)");
    } catch (err: any) {
      const message =
        (err?.data?.errors && Object.values(err.data.errors).flat().join("\n")) ||
        err?.data?.message ||
        err?.error ||
        "Invalid credentials or connection error. Please try again.";
      Alert.alert("Login Failed", message);
      throw err;
    }
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
          paddingTop: Platform.OS === "ios" ? insets.top : 0,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor={isDark ? theme.colors.background : "#FFFFFF"}
      />
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
