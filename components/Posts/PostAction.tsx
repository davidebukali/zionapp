import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, TouchableOpacity } from "react-native";

import { globalStyles } from "../../assets/styles/theme";

type PostActionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
  color: string;
  accessibilityLabel: string;
  onPress?: () => void;
};

export function PostAction({
  icon,
  label,
  color,
  accessibilityLabel,
  onPress,
}: PostActionProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      style={globalStyles.postAction}
      onPress={onPress}
    >
      <Ionicons name={icon} size={31} color={color} />
      {label ? (
        <Text style={[globalStyles.postActionText, { color }]}>{label}</Text>
      ) : null}
    </TouchableOpacity>
  );
}
