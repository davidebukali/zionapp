import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { AuthHeader } from "./AuthHeader";
import { AuthInput } from "./AuthInput";
import { AuthButton } from "./AuthButton";
import { AuthFooter } from "./AuthFooter";
import { CodeExpiryBadge } from "./CodeExpiryBadge";
import { OtpCodeCard } from "./OtpCodeCard";
import { globalStyles } from "../../assets/styles/theme";
import {
  useForgotPasswordMutation,
  useVerifyCodeMutation,
} from "../../features/auth/api";

const CODE_EXPIRY_SECONDS = 120; // 2 minutes

export type ForgotPasswordFormProps = {
  initialEmail?: string;
  onSuccess?: (email: string, code: string) => void;
  onSignIn?: () => void;
};

export function ForgotPasswordForm({
  initialEmail = "",
  onSuccess,
  onSignIn,
}: ForgotPasswordFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(CODE_EXPIRY_SECONDS);

  const [forgotPassword, { isLoading: isSendingCode }] =
    useForgotPasswordMutation();
  const [verifyCode, { isLoading: isVerifyingCode }] = useVerifyCodeMutation();

  const hiddenInputRef = useRef<TextInput>(null);
  const isExpired = timeLeft <= 0;

  useEffect(() => {
    if (!codeSent || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [codeSent, timeLeft]);

  const handleSendCode = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Please enter your email address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError(undefined);

    try {
      await forgotPassword({ email: trimmedEmail }).unwrap();
      setCodeSent(true);
      setCode("");
      setTimeLeft(CODE_EXPIRY_SECONDS);
      setTimeout(() => {
        hiddenInputRef.current?.focus();
      }, 150);
    } catch (err: any) {
      const errorMsg =
        (err?.data?.errors && Object.values(err.data.errors).flat().join("\n")) ||
        err?.data?.message ||
        err?.error ||
        "Could not send reset code. Please check your email and try again.";
      Alert.alert("Request Failed", errorMsg);
    }
  };

  const handleCodeChange = async (val: string) => {
    if (isVerifyingCode) return;

    const cleaned = val.replace(/[^0-9]/g, "").slice(0, 6);
    setCode(cleaned);

    if (cleaned.length === 6) {
      try {
        await verifyCode({
          email: email.trim(),
          code: cleaned,
        }).unwrap();

        if (onSuccess) {
          onSuccess(email.trim(), cleaned);
        } else {
          router.push({
            pathname: "/(auth)/reset-password",
            params: { email: email.trim(), code: cleaned },
          });
        }
      } catch (err: any) {
        const errorMsg =
          (err?.data?.errors && Object.values(err.data.errors).flat().join("\n")) ||
          err?.data?.message ||
          err?.error ||
          "The verification code is invalid or has expired.";

        Alert.alert("Verification Failed", errorMsg, [
          {
            text: "Try Again",
            onPress: () => {
              setCode("");
              hiddenInputRef.current?.focus();
            },
          },
        ]);
        setCode("");
      }
    }
  };

  const handleSignInPress = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      router.replace("/(auth)/login");
    }
  };

  return (
    <View style={styles.container}>
      <AuthHeader
        title="Reset your password"
        subtitle="Enter the email you used to sign up and we'll send a 6-digit code."
        iconName="mail-outline"
      />

      <View style={globalStyles.authFormSection}>
        <AuthInput
          iconName="mail-outline"
          placeholder="Email address"
          keyboardType="email-address"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) setEmailError(undefined);
          }}
          error={emailError}
          autoFocus={false}
          editable={!isSendingCode}
        />

        <AuthButton
          title={isSendingCode ? "Sending code..." : "Send reset code"}
          loading={isSendingCode}
          onPress={handleSendCode}
          style={styles.sendButton}
        />

        {codeSent && (
          <>
            <CodeExpiryBadge timeLeft={timeLeft} isExpired={isExpired} />
            <OtpCodeCard
              ref={hiddenInputRef}
              code={code}
              onChangeCode={handleCodeChange}
              isExpired={isExpired}
              onResend={handleSendCode}
              isSendingCode={isSendingCode}
              isVerifyingCode={isVerifyingCode}
            />
          </>
        )}

        <AuthFooter
          promptText="Remember your password?"
          actionText="Sign in"
          onActionPress={handleSignInPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  sendButton: {
    marginTop: 4,
    marginBottom: 20,
  },
});

export default ForgotPasswordForm;
