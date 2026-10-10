import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";

type RememberMeRowProps = {
  rememberMe: boolean;
  onToggleRememberMe: () => void;
  onForgotPassword?: () => void;
};

export function RememberMeRow({
  rememberMe,
  onToggleRememberMe,
  onForgotPassword,
}: RememberMeRowProps) {
  const theme = useTheme();
  const isDark = useColorScheme() === "dark";

  return (
    <View style={styles.container}>
      {/* Checkbox and label */}
      <TouchableOpacity
        style={styles.checkboxTouch}
        onPress={onToggleRememberMe}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: rememberMe
                ? theme.colors.primary
                : "transparent",
              borderColor: rememberMe
                ? theme.colors.primary
                : isDark
                ? theme.colors.outline
                : "#D0C4C4",
            },
          ]}
        >
          {rememberMe && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </View>
        <Text
          style={[
            styles.label,
            { color: isDark ? theme.colors.onBackground : "#111111" },
          ]}
        >
          Remember me
        </Text>
      </TouchableOpacity>

      {/* Forgot Password Link */}
      <TouchableOpacity onPress={onForgotPassword} activeOpacity={0.7}>
        <Text style={[styles.forgotLink, { color: theme.colors.primary }]}>
          Forgot password?
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 28,
  },
  checkboxTouch: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
  },
  forgotLink: {
    fontSize: 15,
    fontWeight: "600",
  },
});
