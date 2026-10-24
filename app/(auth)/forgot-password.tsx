import React from "react";
import { useRouter } from "expo-router";
import {
  AuthScreenLayout,
  AuthTopNav,
  ForgotPasswordForm,
} from "../../components/Auth";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <AuthScreenLayout topNav={<AuthTopNav accessibilityLabel="Back to sign in" />}>
      <ForgotPasswordForm
        onSuccess={(email, code) =>
          router.push({
            pathname: "/(auth)/reset-password",
            params: { email, code },
          })
        }
        onSignIn={() => router.replace("/(auth)/login")}
      />
    </AuthScreenLayout>
  );
}
