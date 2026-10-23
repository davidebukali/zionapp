import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";

type AuthInputProps = TextInputProps & {
  iconName: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  error?: string;
};

export function AuthInput({
  iconName,
  isPassword = false,
  error,
  style,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  ...restProps
}: AuthInputProps) {
  const theme = useTheme();
  const isDark = useColorScheme() === "dark";
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const containerBg = isDark ? "#221C1C" : "#FFF3ED";
  const iconColor = isDark ? theme.colors.onSurfaceVariant : "#4A4A4A";
  const textColor = isDark ? theme.colors.onSurface : "#111111";
  const errorColor = theme.colors?.error || "#E53935";

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          { backgroundColor: containerBg },
          isFocused && {
            borderWidth: 1.5,
            borderColor: theme.colors.primary,
          },
          !!error && {
            borderWidth: 1.5,
            borderColor: errorColor,
          },
        ]}
      >
        <Ionicons
          name={iconName}
          size={22}
          color={iconColor}
          style={styles.leftIcon}
        />
        <TextInput
          style={[styles.input, { color: textColor }, style]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? "#888888" : "#8A8A8A"}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          {...restProps}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            activeOpacity={0.7}
            style={styles.rightIconButton}
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={iconColor}
            />
          </TouchableOpacity>
        )}
      </View>
      {!!error && (
        <Text style={[styles.errorText, { color: errorColor }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 16,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 58,
    borderRadius: 29,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  leftIcon: {
    marginRight: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 0,
  },
  rightIconButton: {
    padding: 6,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    marginLeft: 16,
  },
});
