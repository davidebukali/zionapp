import React from "react";
import { TouchableOpacity, View, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles } from "../../assets/styles/theme";

export type AuthTopNavProps = {
  onBack?: () => void;
  accessibilityLabel?: string;
};

export function AuthTopNav({
  onBack,
  accessibilityLabel = "Back to previous screen",
}: AuthTopNavProps) {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const buttonBg = isDark ? "#201818" : "#F2E8E8";
  const iconColor = isDark ? "#FFFFFF" : "#111111";

  return (
    <View style={globalStyles.authNavBar}>
      <TouchableOpacity
        onPress={handleBack}
        style={[globalStyles.authBackButton, { backgroundColor: buttonBg }]}
        activeOpacity={0.7}
        accessibilityLabel={accessibilityLabel}
      >
        <Ionicons name="chevron-back" size={22} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}

export default AuthTopNav;
