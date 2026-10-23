import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { AuthButton, AuthInput } from "../../components/Auth";
import { globalStyles } from "../../assets/styles/theme";

const CODE_EXPIRY_SECONDS = 300; // 5 minutes

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("2941"); // Initial sample code matching mockup
  const [codeSent, setCodeSent] = useState(true); // Preview mode: displays code card as in mockup
  const [loading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(CODE_EXPIRY_SECONDS);

  const hiddenInputRef = useRef<TextInput>(null);

  const bgColor = isDark ? "#120E0E" : "#FFFFFF";
  const textColor = isDark ? "#FFFFFF" : "#111111";
  const subtitleColor = isDark ? "#8E8888" : "#6E6868";
  const iconBadgeBg = isDark ? "#2A1616" : "#FFEBEA";
  const codeCardBg = isDark ? "#1A1313" : "#F7F0F0";
  const circleEmptyBg = isDark ? "#251C1C" : "#E9DFDF";
  const primaryColor = theme.colors.primary || "#E53935";

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendCode = () => {
    setCodeSent(true);
    setTimeLeft(CODE_EXPIRY_SECONDS);
    setTimeout(() => {
      hiddenInputRef.current?.focus();
    }, 150);
  };

  const handleCodeChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "").slice(0, 6);
    setCode(cleaned);

    if (cleaned.length === 6) {
      setTimeout(() => {
        router.push({
          pathname: "/(auth)/reset-password",
          params: { email: email.trim() || "alex@zion.app", code: cleaned },
        });
      }, 150);
    }
  };

  const handleCirclePress = () => {
    hiddenInputRef.current?.focus();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          paddingTop: Platform.OS === "ios" ? insets.top : 16,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={bgColor} />

      {/* Top Navigation */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: isDark ? "#201818" : "#F2E8E8" }]}
          activeOpacity={0.7}
          accessibilityLabel="Back to login"
        >
          <Ionicons name="chevron-back" size={22} color={textColor} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[globalStyles.scrollContent, styles.scrollContent]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Mail Icon Badge */}
          <View style={[styles.iconBadge, { backgroundColor: iconBadgeBg }]}>
            <Ionicons name="mail-outline" size={30} color={primaryColor} />
          </View>

          {/* Heading Section */}
          <Text style={[styles.title, { color: textColor }]}>
            Reset your password
          </Text>
          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            Enter the email you used to sign up and we'll send a 6-digit code.
          </Text>

          {/* Email Input */}
          <View style={styles.formSection}>
            <AuthInput
              iconName="mail-outline"
              placeholder="alex@zion.app"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoFocus={false}
            />

            {/* Send Reset Code Button */}
            <AuthButton
              title="Send reset code"
              loading={loading}
              onPress={handleSendCode}
              style={styles.sendButton}
            />

            {/* Expiration Countdown */}
            {codeSent && (
              <View
                style={[
                  styles.countdownBadge,
                  {
                    backgroundColor: isDark
                      ? isExpired
                        ? "#2D1515"
                        : "#221818"
                      : isExpired
                      ? "#FCE8E6"
                      : "#F7EDED",
                    borderColor: isExpired
                      ? theme.colors?.error || "#E53935"
                      : isDark
                      ? "#322222"
                      : "#EADCDC",
                  },
                ]}
              >
                <Ionicons
                  name={isExpired ? "alert-circle-outline" : "timer-outline"}
                  size={16}
                  color={isExpired ? theme.colors?.error || "#E53935" : primaryColor}
                  style={styles.countdownIcon}
                />
                <Text
                  style={[
                    styles.countdownText,
                    { color: isExpired ? theme.colors?.error || "#E53935" : textColor },
                  ]}
                >
                  {isExpired ? (
                    "Code expired. Please request a new code."
                  ) : (
                    <>
                      Code expires in{" "}
                      <Text style={[styles.countdownTime, { color: primaryColor }]}>
                        {formatTime(timeLeft)}
                      </Text>
                    </>
                  )}
                </Text>
              </View>
            )}

            {/* 6-Digit Code Card (matching screenshot design) */}
            {codeSent && (
              <View style={[styles.codeCard, { backgroundColor: codeCardBg }]}>
                <Text style={[styles.codeCardTitle, { color: textColor }]}>
                  Enter 6-digit code
                </Text>

                {/* Hidden TextInput for native typing */}
                <TextInput
                  ref={hiddenInputRef}
                  value={code}
                  onChangeText={handleCodeChange}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={styles.hiddenInput}
                  accessibilityLabel="6-digit verification code"
                />

                {/* 6 Circular Code Boxes */}
                <TouchableOpacity
                  style={styles.circlesRow}
                  activeOpacity={1}
                  onPress={handleCirclePress}
                >
                  {[0, 1, 2, 3, 4, 5].map((index) => {
                    const digit = code[index] || "";
                    const isFilled = digit.length > 0;
                    const isActive = index === code.length && code.length < 6;

                    return (
                      <View
                        key={index}
                        style={[
                          styles.codeCircle,
                          {
                            backgroundColor: isFilled
                              ? isDark
                                ? "#140D0D"
                                : "#FFFFFF"
                              : circleEmptyBg,
                            borderColor: isFilled || isActive ? primaryColor : "transparent",
                            borderWidth: isFilled || isActive ? 2 : 1.5,
                          },
                        ]}
                      >
                        {isFilled && (
                          <Text style={[styles.digitText, { color: textColor }]}>
                            {digit}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </TouchableOpacity>

                {/* Resend Link */}
                <View style={styles.resendRow}>
                  <Text style={[styles.resendPrompt, { color: subtitleColor }]}>
                    Didn't receive the code?{" "}
                  </Text>
                  <TouchableOpacity onPress={handleSendCode} activeOpacity={0.7}>
                    <Text style={[styles.resendLink, { color: primaryColor }]}>
                      Resend
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Bottom Link to return to sign in */}
            <View style={styles.footerContainer}>
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/login")}
                activeOpacity={0.7}
                style={styles.footerTouch}
              >
                <Text style={[styles.footerText, { color: subtitleColor }]}>
                  Remember your password?{" "}
                  <Text style={{ color: primaryColor, fontWeight: "600" }}>
                    Sign in
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  navBar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
    marginBottom: 28,
  },
  formSection: {
    width: "100%",
  },
  sendButton: {
    marginTop: 4,
    marginBottom: 20,
  },
  countdownBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  countdownIcon: {
    marginRight: 6,
  },
  countdownText: {
    fontSize: 13,
    fontWeight: "500",
  },
  countdownTime: {
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  codeCard: {
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
    marginTop: 8,
    marginBottom: 28,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  codeCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 18,
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  circlesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  codeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  digitText: {
    fontSize: 18,
    fontWeight: "700",
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  resendPrompt: {
    fontSize: 13,
  },
  resendLink: {
    fontSize: 13,
    fontWeight: "600",
  },
  footerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
  },
  footerTouch: {
    paddingVertical: 10,
  },
  footerText: {
    fontSize: 14,
  },
});
