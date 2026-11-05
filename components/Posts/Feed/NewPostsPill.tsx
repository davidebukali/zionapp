import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NewPostsPillProps } from "./types";
import { formatNewPostsLabel } from "../../../features/posts/utils";

export const NewPostsPill = React.memo(function NewPostsPill({
  count,
  onPress,
}: NewPostsPillProps) {
  const theme = useTheme();

  if (count <= 0) {
    return null;
  }

  const label = formatNewPostsLabel(count);

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Load ${label}`}
        style={[
          styles.pillButton,
          {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.shadow,
          },
        ]}
      >
        <Ionicons
          name="arrow-up"
          size={16}
          color={theme.colors.onPrimary}
          style={styles.icon}
        />
        <Text style={[styles.pillText, { color: theme.colors.onPrimary }]}>
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    top: 12,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 99,
  },
  pillButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  icon: {
    marginRight: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});

