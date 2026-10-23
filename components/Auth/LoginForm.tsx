import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthHeader } from "./AuthHeader";
import { AuthInput } from "./AuthInput";
import { RememberMeRow } from "./RememberMeRow";
import { AuthButton } from "./AuthButton";
import { AuthFooter } from "./AuthFooter";
import { globalStyles } from "../../assets/styles/theme";
import { LoginFormData, loginSchema } from "../../features/auth/types";

type LoginFormProps = {
  initialEmail?: string;
  initialPassword?: string;
  onSignIn?: (data: LoginFormData) => Promise<void> | void;
  onForgotPassword?: () => void;
  onCreateAccount?: () => void;
};

export function LoginForm({
  initialEmail = "",
  initialPassword = "",
  onSignIn,
  onForgotPassword,
  onCreateAccount,
}: LoginFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: initialEmail,
      password: initialPassword,
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      if (onSignIn) {
        await onSignIn(data);
      }
    } catch {
      // Error handling is handled upstream in onSignIn
    } finally {
      setLoading(false);
    }
  };

  return (
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
          title="Welcome back"
          subtitle="Sign in to pick up where you left off."
          badgeText="Project preview"
        />

        <View style={styles.formContainer}>
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

          <Controller
            control={control}
            name="rememberMe"
            render={({ field: { value, onChange } }) => (
              <RememberMeRow
                rememberMe={value}
                onToggleRememberMe={() => onChange(!value)}
                onForgotPassword={onForgotPassword}
              />
            )}
          />

          <AuthButton
            title={loading ? "Signing in..." : "Sign in"}
            loading={loading}
            onPress={handleSubmit(onSubmit)}
          />

          <AuthFooter onActionPress={onCreateAccount} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  formContainer: {
    width: "100%",
  },
});

