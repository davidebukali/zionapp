import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { useDispatch } from "react-redux";
import {
  AuthButton,
  AuthFooter,
  AuthHeader,
  AuthInput,
} from "../../components/Auth";
import { loginUser } from "../../features/auth/authSlice";
import { useRegisterMutation, useLoginMutation } from "../../features/auth/api";
import { AppDispatch } from "../../store/store";

export default function RegisterScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [registerApi] = useRegisterMutation();
  const [loginApi] = useLoginMutation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    if (!password) {
      Alert.alert("Error", "Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      const response = await registerApi({
        name: name.trim(),
        email: email.trim(),
        password,
      }).unwrap();

      const user =
        response.resource ||
        response.data?.user || {
          id: "1",
          email: email.trim(),
          name: name.trim(),
        };

      let token =
        response?.data?.token ||
        response?.token ||
        response?.access_token ||
        response?.data?.access_token;

      // If backend registration does not issue a token directly, auto-login with credentials
      if (!token) {
        try {
          const loginRes = await loginApi({
            email: email.trim(),
            password,
          }).unwrap();

          token =
            loginRes?.data?.token ||
            loginRes?.token ||
            loginRes?.access_token ||
            loginRes?.data?.access_token;
        } catch {
          // If auto-login fails, inform user that account was created
          Alert.alert(
            "Account Created",
            "Your account was created successfully. Please sign in.",
            [{ text: "Sign In", onPress: () => router.replace("/(auth)/login") }]
          );
          return;
        }
      }

      if (token) {
        await dispatch(loginUser({ token, user }));
        router.replace("/(app)/(tabs)");
      } else {
        Alert.alert(
          "Account Created",
          "Your account was created successfully. Please sign in.",
          [{ text: "Sign In", onPress: () => router.replace("/(auth)/login") }]
        );
      }
    } catch (err: any) {
      const errorMsg =
        (err?.data?.errors && Object.values(err.data.errors).flat().join("\n")) ||
        err?.data?.message ||
        err?.error ||
        "Registration failed. Please check your details and try again.";
      Alert.alert("Registration Failed", errorMsg);
    } finally {
      setLoading(false);
    }
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
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader
            title="Create account"
            subtitle="Sign up to start your journey with us."
            badgeText="Project preview"
          />

          <View style={styles.formContainer}>
            <AuthInput
              iconName="person-outline"
              placeholder="Full name"
              value={name}
              onChangeText={setName}
            />

            <AuthInput
              iconName="mail-outline"
              placeholder="Email address"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <AuthInput
              iconName="lock-closed-outline"
              placeholder="Password"
              isPassword
              value={password}
              onChangeText={setPassword}
            />

            <View style={styles.spacing} />

            <AuthButton
              title="Create account"
              loading={loading}
              onPress={handleRegister}
            />

            <AuthFooter
              promptText="Already have an account?"
              actionText="Sign in"
              onActionPress={() => router.back()}
            />
          </View>
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  formContainer: {
    width: "100%",
  },
  spacing: {
    height: 16,
  },
});
