import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { AuthHeader } from "./AuthHeader";
import { AuthInput } from "./AuthInput";
import { RememberMeRow } from "./RememberMeRow";
import { AuthButton } from "./AuthButton";
import { AuthFooter } from "./AuthFooter";

type LoginFormProps = {
  initialEmail?: string;
  initialPassword?: string;
  onSignIn?: (email: string, password: string, rememberMe: boolean) => Promise<void> | void;
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
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
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
      if (onSignIn) {
        await onSignIn(email, password, rememberMe);
      }
    } catch {
      Alert.alert("Sign In Failed", "Invalid credentials. Please try again.");
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
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthHeader
          title="Welcome back"
          subtitle="Sign in to pick up where you left off."
          badgeText="Project preview"
        />

        <View style={styles.formContainer}>
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

          <RememberMeRow
            rememberMe={rememberMe}
            onToggleRememberMe={() => setRememberMe((prev) => !prev)}
            onForgotPassword={onForgotPassword}
          />

          <AuthButton
            title="Sign in"
            loading={loading}
            onPress={handleSignIn}
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  formContainer: {
    width: "100%",
  },
});
