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
import {
  AuthButton,
  AuthFooter,
  AuthHeader,
  AuthInput,
} from "../components/Auth";

export default function RegisterScreen() {
  const router = useRouter();
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

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    router.replace("/(tabs)");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? theme.colors.background : "#FFFFFF",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
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
    justifyContent: "center",
  },
  formContainer: {
    width: "100%",
  },
  spacing: {
    height: 16,
  },
});
