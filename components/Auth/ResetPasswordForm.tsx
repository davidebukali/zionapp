import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { AuthHeader } from "./AuthHeader";
import { AuthInput } from "./AuthInput";
import { AuthButton } from "./AuthButton";
import { AuthFooter } from "./AuthFooter";
import { VerifiedAccountBadge } from "./VerifiedAccountBadge";
import { globalStyles } from "../../assets/styles/theme";
import { useResetPasswordMutation } from "../../features/auth/api";

export type ResetPasswordFormProps = {
  email: string;
  code?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function ResetPasswordForm({
  email,
  code,
  onSuccess,
  onCancel,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSuccessRedirect = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      router.replace("/(auth)/login");
    }
  };

  const handleCancelPress = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.replace("/(auth)/login");
    }
  };

  const handleChangePassword = async () => {
    if (!password) {
      setPasswordError("Please enter your new password");
      return;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setPasswordError(undefined);

    try {
      await resetPassword({
        email: email.trim(),
        password,
        password_confirmation: password,
      }).unwrap();

      Alert.alert(
        "Password Changed",
        "Your password has been successfully updated. Please sign in with your new password.",
        [{ text: "Sign In", onPress: handleSuccessRedirect }]
      );
    } catch (err: any) {
      const errorMsg =
        (err?.data?.errors && Object.values(err.data.errors).flat().join("\n")) ||
        err?.data?.message ||
        err?.error ||
        "Could not update password. Please try again.";
      Alert.alert("Password Reset Failed", errorMsg);
    }
  };

  return (
    <View style={styles.container}>
      <AuthHeader
        title="Change password"
        subtitle="Your code was verified. Create a new strong password for your account."
        iconName="lock-closed-outline"
      />

      <View style={globalStyles.authFormSection}>
        <VerifiedAccountBadge email={email} />

        <AuthInput
          iconName="lock-closed-outline"
          placeholder="New password (min 8 characters)"
          isPassword
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError(undefined);
          }}
          error={passwordError}
        />

        <AuthButton
          title={isLoading ? "Updating password..." : "Change password"}
          loading={isLoading}
          onPress={handleChangePassword}
          style={styles.submitButton}
        />

        <AuthFooter
          promptText="Never mind,"
          actionText="Back to Sign in"
          onActionPress={handleCancelPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});

export default ResetPasswordForm;
