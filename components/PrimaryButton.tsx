import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
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
        <View style={styles.loadingRow}>
          <ActivityIndicator color={theme.colors.onPrimary || "#FFFFFF"} size="small" />
          {title ? (
            <Text style={[globalStyles.primaryButtonText, textStyle, styles.loadingText]}>
              {title}
            </Text>
          ) : null}
        </View>
      ) : (
        <Text style={[globalStyles.primaryButtonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginLeft: 8,
  },
});

export default PrimaryButton;
