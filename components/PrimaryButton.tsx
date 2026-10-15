import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { useTheme } from "react-native-paper";
import { globalStyles } from "../assets/styles/theme";

export type PrimaryButtonProps = TouchableOpacityProps & {
  title: string;
  loading?: boolean;
  textStyle?: StyleProp<TextStyle>;
};

export function PrimaryButton({
  title,
  loading = false,
  disabled,
  style,
  textStyle,
  onPress,
  ...restProps
}: PrimaryButtonProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        globalStyles.primaryButton,
        {
          backgroundColor: theme.colors.primary,
          shadowColor: theme.colors.primary,
        },
        (disabled || loading) && globalStyles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      {...restProps}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.onPrimary || "#FFFFFF"} size="small" />
      ) : (
        <Text style={[globalStyles.primaryButtonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export default PrimaryButton;
