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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AuthButton,
  AuthFooter,
  AuthHeader,
  AuthInput,
} from "../../components/Auth";
import { saveUserData } from "../../features/auth/authSlice";
import { useRegisterMutation, useLoginMutation } from "../../features/auth/api";
import { AppDispatch } from "../../store/store";
import { globalStyles } from "../../assets/styles/theme";
import { RegisterFormData, SubmissionPhase, registerSchema } from "../../features/auth/types";

export default function RegisterScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [registerApi] = useRegisterMutation();
  const [login] = useLoginMutation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";

  const [submissionPhase, setSubmissionPhase] = useState<SubmissionPhase>("idle");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const trimmedName = data.name.trim();
    const trimmedEmail = data.email.trim();

    try {
      // Step 1: Register user on backend
      setSubmissionPhase("creating_account");
      const registerResponse = await registerApi({
        name: trimmedName,
        email: trimmedEmail,
        password: data.password,
      }).unwrap();

      const user =
        registerResponse.resource ||
        registerResponse.data?.user || {
          id: "1",
          email: trimmedEmail,
          name: trimmedName,
        };

      // Step 2: Auto-login only if registration succeeded
      setSubmissionPhase("logging_in");
      try {
        const loginRes = await login({
          email: trimmedEmail,
          password: data.password,
        }).unwrap();

        const token =
          loginRes?.data?.token ||
          loginRes?.token ||
          loginRes?.access_token ||
          loginRes?.data?.access_token;

        if (token) {
          await dispatch(saveUserData({ token, user }));
          router.replace("/(app)/(tabs)");
          return;
        }
      } catch {
        // Auto-login failed: inform user that account was created
        Alert.alert(
          "Account Created",
          "Your account was created successfully! Please sign in with your email and password.",
          [{ text: "Sign In", onPress: () => router.replace("/(auth)/login") }]
        );
        return;
      }

      // Fallback if login call completed without a usable token
      Alert.alert(
        "Account Created",
        "Your account was created successfully! Please sign in with your email and password.",
        [{ text: "Sign In", onPress: () => router.replace("/(auth)/login") }]
      );
    } catch (err: any) {
      // Step 1 Register failure
      const errorMsg =
        (err?.data?.errors && Object.values(err.data.errors).flat().join("\n")) ||
        err?.data?.message ||
        err?.error ||
        "Registration failed. Please check your details and try again.";
      Alert.alert("Registration Failed", errorMsg);
    } finally {
      setSubmissionPhase("idle");
    }
  };

  const buttonTitle =
    submissionPhase === "creating_account"
      ? "Creating account..."
      : submissionPhase === "logging_in"
      ? "Signing you in..."
      : "Create account";

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
          contentContainerStyle={globalStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader
            title="Create account"
            subtitle="Sign up to start your journey with us."
            badgeText="Project preview"
          />

          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  iconName="person-outline"
                  placeholder="Full name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  iconName="mail-outline"
                  placeholder="Email address"
                  keyboardType="email-address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  iconName="lock-closed-outline"
                  placeholder="Password"
                  isPassword
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />

            <View style={styles.spacing} />

            <AuthButton
              title={buttonTitle}
              loading={submissionPhase !== "idle"}
              onPress={handleSubmit(onSubmit)}
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
  formContainer: {
    width: "100%",
  },
  spacing: {
    height: 16,
  },
});
