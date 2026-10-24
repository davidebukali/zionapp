import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useTheme } from "react-native-paper";
import { globalStyles } from "../../assets/styles/theme";

export type OtpCodeCardProps = {
  code: string;
  onChangeCode: (val: string) => void;
  isExpired?: boolean;
  onResend?: () => void;
  isSendingCode?: boolean;
  isVerifyingCode?: boolean;
  inputRef?: React.RefObject<TextInput | null>;
};

export const OtpCodeCard = React.forwardRef<TextInput, OtpCodeCardProps>(
  (
    {
      code,
      onChangeCode,
      isExpired = false,
      onResend,
      isSendingCode = false,
      isVerifyingCode = false,
      inputRef,
    },
    ref
  ) => {
    const theme = useTheme();
    const isDark = useColorScheme() === "dark";

    const textColor = isDark ? "#FFFFFF" : "#111111";
    const subtitleColor = isDark ? "#8E8888" : "#6E6868";
    const codeCardBg = isDark ? "#1A1313" : "#F7F0F0";
    const circleEmptyBg = isDark ? "#251C1C" : "#E9DFDF";
    const primaryColor = theme.colors.primary || "#E53935";

    const localRef = React.useRef<TextInput>(null);
    const resolvedRef = (ref || inputRef || localRef) as React.RefObject<TextInput>;

    return (
      <View style={styles.wrapper}>
        <View style={[globalStyles.authCard, { backgroundColor: codeCardBg }]}>
          <Text style={[styles.codeCardTitle, { color: textColor }]}>
            Enter 6-digit code
          </Text>

          {/* 6 Circular Code Boxes with Overlay TextInput */}
          <View style={styles.circlesContainer}>
            <View style={styles.circlesRow} pointerEvents="none">
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
                        borderColor:
                          isFilled || isActive ? primaryColor : "transparent",
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
            </View>

            {/* Transparent overlay TextInput directly capturing touches */}
            <TextInput
              ref={resolvedRef}
              value={code}
              onChangeText={onChangeCode}
              keyboardType="number-pad"
              maxLength={6}
              editable={!isVerifyingCode}
              caretHidden={true}
              style={styles.overlayInput}
              accessibilityLabel="6-digit verification code"
            />
          </View>

          {/* Resend Link: Shown ONLY when code has expired */}
          {isExpired && (
            <View style={styles.resendRow}>
              <Text style={[styles.resendPrompt, { color: subtitleColor }]}>
                Didn't receive the code?{" "}
              </Text>
              <TouchableOpacity
                onPress={onResend}
                activeOpacity={0.7}
                disabled={isSendingCode}
              >
                <Text style={[styles.resendLink, { color: primaryColor }]}>
                  Resend
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Loading indicator below the code card when verifying */}
        {isVerifyingCode && (
          <View style={styles.verifyingContainer}>
            <ActivityIndicator size="small" color={primaryColor} />
            <Text style={[styles.verifyingText, { color: subtitleColor }]}>
              Verifying code...
            </Text>
          </View>
        )}
      </View>
    );
  }
);

OtpCodeCard.displayName = "OtpCodeCard";

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  codeCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 18,
  },
  circlesContainer: {
    position: "relative",
    width: "100%",
    justifyContent: "center",
    marginBottom: 16,
  },
  circlesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  overlayInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
    fontSize: 24,
    color: "transparent",
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
  verifyingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -12,
    marginBottom: 20,
  },
  verifyingText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default OtpCodeCard;
