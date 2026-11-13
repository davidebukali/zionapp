import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../../../assets/styles/theme";
import { BottomSheetProps } from "./types";

export const BottomSheet = React.memo(function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  closeAccessibilityLabel = "Close sheet",
  backdropAccessibilityLabel = "Dismiss sheet",
  sheetStyle,
  contentStyle,
  keyboardAvoiding = false,
  hideHeader = false,
  hideDragHandle = false,
  children,
}: BottomSheetProps) {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();

  const sheetBody = (
    <Pressable
      style={[
        styles.sheetContainer,
        {
          backgroundColor: theme.colors.surface,
          paddingBottom: Math.max(safeAreaInsets.bottom + 12, 24),
        },
        sheetStyle,
      ]}
      onPress={(event) => event.stopPropagation()}
    >
      {/* Drag Handle */}
      {!hideDragHandle && (
        <View
          style={[
            styles.dragHandle,
            { backgroundColor: theme.colors.outline },
          ]}
        />
      )}

      {/* Optional Title Header */}
      {!hideHeader && title && (
        <View style={[globalStyles.row, styles.headerRow]}>
          <Text
            style={[
              globalStyles.commentsHeaderTitle,
              { color: theme.colors.onSurface },
            ]}
          >
            {title}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={closeAccessibilityLabel}
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
      )}

      {/* Optional Subtitle */}
      {!hideHeader && subtitle && (
        <Text
          style={[
            styles.subtitleText,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {subtitle}
        </Text>
      )}

      {/* Body Content */}
      <View style={[styles.contentContainer, contentStyle]}>{children}</View>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: theme.colors.backdrop }]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={backdropAccessibilityLabel}
      >
        {keyboardAvoiding ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardAvoid}
          >
            {sheetBody}
          </KeyboardAvoidingView>
        ) : (
          sheetBody
        )}
      </Pressable>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  keyboardAvoid: {
    width: "100%",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 12,
  },
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
    paddingBottom: 4,
    justifyContent: "space-between",
  },
  subtitleText: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    fontSize: 14,
  },
  contentContainer: {
    marginTop: 4,
  },
});
