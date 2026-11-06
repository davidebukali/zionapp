import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../../assets/styles/theme";

export interface NewMessageSheetHeaderProps {
  title?: string;
  subtitle?: string;
  onClose: () => void;
}

export const NewMessageSheetHeader = React.memo(
  function NewMessageSheetHeader({
    title,
    subtitle,
    onClose,
  }: NewMessageSheetHeaderProps) {
    const theme = useTheme();

    return (
      <>
        {/* Drag Handle */}
        <View
          style={[
            styles.dragHandle,
            { backgroundColor: theme.colors.outline },
          ]}
        />

        {/* Header Title & Close Button */}
        <View style={[globalStyles.row, styles.headerRow]}>
          <View style={styles.titleColumn}>
            <Text
              style={[
                globalStyles.commentsHeaderTitle,
                { color: theme.colors.onSurface },
              ]}
              numberOfLines={1}
            >
              {title || "New Message"}
            </Text>
            {Boolean(subtitle) && (
              <Text
                style={[
                  globalStyles.postBodyText,
                  styles.subtitleText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={title ? `Close ${title}` : "Close new message"}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={globalStyles.postIconButton}
          >
            <Ionicons
              name="close"
              size={22}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>
      </>
    );
  }
);

const styles = StyleSheet.create({
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
    opacity: 0.5,
  },
  headerRow: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  titleColumn: {
    flex: 1,
    paddingRight: 8,
  },
  subtitleText: {
    fontSize: 13,
    marginTop: 2,
  },
});

