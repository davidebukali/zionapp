import React from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type VerifiedAccountBadgeProps = {
  email: string;
};

export function VerifiedAccountBadge({ email }: VerifiedAccountBadgeProps) {
  const isDark = useColorScheme() === "dark";

  const verifiedBadgeBg = isDark ? "#1A1313" : "#F7F0F0";
  const verifiedBadgeBorder = isDark ? "#2E1C1C" : "#E8DCDC";
  const textColor = isDark ? "#FFFFFF" : "#111111";

  if (!email) return null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: verifiedBadgeBg, borderColor: verifiedBadgeBorder },
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="checkmark-circle" size={20} color="#2ECC71" />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.label}>VERIFIED ACCOUNT</Text>
        <Text style={[styles.email, { color: textColor }]}>{email}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
    width: "100%",
  },
  iconWrap: {
    marginRight: 12,
  },
  textCol: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2ECC71",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  email: {
    fontSize: 15,
    fontWeight: "600",
  },
});

export default VerifiedAccountBadge;
