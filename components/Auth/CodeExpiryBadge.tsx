import React from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

export type CodeExpiryBadgeProps = {
  timeLeft: number;
  isExpired: boolean;
};

export function CodeExpiryBadge({ timeLeft, isExpired }: CodeExpiryBadgeProps) {
  const theme = useTheme();
  const isDark = useColorScheme() === "dark";

  const primaryColor = theme.colors.primary || "#E53935";
  const errorColor = theme.colors.error || "#BA1A1A";
  const textColor = isDark ? "#FFFFFF" : "#111111";

  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.max(0, seconds) % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const badgeBg = isDark
    ? isExpired
      ? "#2D1515"
      : "#221818"
    : isExpired
    ? "#FCE8E6"
    : "#F7EDED";

  const badgeBorder = isExpired
    ? errorColor
    : isDark
    ? "#322222"
    : "#EADCDC";

  const statusColor = isExpired ? errorColor : primaryColor;

  return (
    <View style={[styles.countdownBadge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
      <Ionicons
        name={isExpired ? "alert-circle-outline" : "timer-outline"}
        size={16}
        color={statusColor}
        style={styles.countdownIcon}
      />
      <Text style={[styles.countdownText, { color: isExpired ? errorColor : textColor }]}>
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
  );
}

const styles = StyleSheet.create({
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
});

export default CodeExpiryBadge;
