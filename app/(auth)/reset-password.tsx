import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AuthScreenLayout,
  AuthTopNav,
  ResetPasswordForm,
} from "../../components/Auth";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email = "", code = "" } = useLocalSearchParams<{
    email?: string;
    code?: string;
  }>();

  return (
    <AuthScreenLayout topNav={<AuthTopNav accessibilityLabel="Back to previous screen" />}>
      <ResetPasswordForm
        email={email}
        code={code}
        onSuccess={() => router.replace("/(auth)/login")}
        onCancel={() => router.replace("/(auth)/login")}
      />
    </AuthScreenLayout>
  );
}
