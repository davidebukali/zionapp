import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { AuthButton, AuthInput } from "../../components/Auth";
import { globalStyles } from "../../assets/styles/theme";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const params = useLocalSearchParams<{ email?: string; code?: string }>();

  const email = params.email || "alex@zion.app";
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const bgColor = isDark ? "#120E0E" : "#FFFFFF";
  const textColor = isDark ? "#FFFFFF" : "#111111";
  const subtitleColor = isDark ? "#8E8888" : "#6E6868";
  const iconBadgeBg = isDark ? "#2A1616" : "#FFEBEA";
  const verifiedBadgeBg = isDark ? "#1A1313" : "#F7F0F0";
  const verifiedBadgeBorder = isDark ? "#2E1C1C" : "#E8DCDC";
  const primaryColor = theme.colors.primary || "#E53935";

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
    setLoading(true);

    try {
      // In design phase: simulate action
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          "Password Changed",
          "Your password has been successfully updated. Please sign in with your new password.",
          [{ text: "Sign In", onPress: () => router.replace("/(auth)/login") }]
        );
      }, 700);
    } catch {
      setLoading(false);
      Alert.alert("Error", "Could not change password. Please try again.");
    }
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
          accessibilityLabel="Back to previous screen"
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
          {/* Lock Icon Badge (matching screenshot inspiration) */}
          <View style={[styles.iconBadge, { backgroundColor: iconBadgeBg }]}>
            <Ionicons name="lock-closed-outline" size={30} color={primaryColor} />
          </View>

          {/* Heading Section */}
          <Text style={[styles.title, { color: textColor }]}>
            Change password
          </Text>
          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            Your code was verified. Create a new strong password for your account.
          </Text>

          <View style={styles.formSection}>
            {/* Verified Account Pill Badge */}
            <View
              style={[
                styles.verifiedBadge,
                { backgroundColor: verifiedBadgeBg, borderColor: verifiedBadgeBorder },
              ]}
            >
              <View style={styles.verifiedIconWrap}>
                <Ionicons name="checkmark-circle" size={20} color="#2ECC71" />
              </View>
              <View style={styles.verifiedTextCol}>
                <Text style={styles.verifiedLabel}>VERIFIED ACCOUNT</Text>
                <Text style={[styles.verifiedEmail, { color: textColor }]}>
                  {email}
                </Text>
              </View>
            </View>

            {/* Single New Password Field */}
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

            {/* Change Password Primary Button */}
            <AuthButton
              title="Change password"
              loading={loading}
              onPress={handleChangePassword}
              style={styles.submitButton}
            />

            {/* Bottom Link to return to sign in */}
            <View style={styles.footerContainer}>
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/login")}
                activeOpacity={0.7}
                style={styles.footerTouch}
              >
                <Text style={[styles.footerText, { color: subtitleColor }]}>
                  Never mind,{" "}
                  <Text style={{ color: primaryColor, fontWeight: "600" }}>
                    Back to Sign in
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
    marginBottom: 24,
  },
  formSection: {
    width: "100%",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  verifiedIconWrap: {
    marginRight: 12,
  },
  verifiedTextCol: {
    flex: 1,
  },
  verifiedLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2ECC71",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  verifiedEmail: {
    fontSize: 15,
    fontWeight: "600",
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
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
