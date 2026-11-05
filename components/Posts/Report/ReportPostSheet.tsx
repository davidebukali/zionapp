import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../../../assets/styles/theme";
import { POST_REPORT_REASONS } from "./constants";
import { ReportPostSheetProps } from "./types";

export const ReportPostSheet = React.memo(function ReportPostSheet({
  visible,
  authorName,
  onClose,
  onSelectReason,
}: ReportPostSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

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
        accessibilityLabel="Dismiss report sheet"
      >
        <Pressable
          style={[
            styles.sheetContainer,
            {
              backgroundColor: theme.colors.surface,
              paddingBottom: Math.max(insets.bottom + 12, 24),
            },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          {/* Drag Handle */}
          <View
            style={[
              styles.dragHandle,
              { backgroundColor: theme.colors.outline },
            ]}
          />

          {/* Header Row */}
          <View style={[globalStyles.row, styles.headerRow]}>
            <Text
              style={[
                globalStyles.commentsHeaderTitle,
                { color: theme.colors.onSurface },
              ]}
            >
              Report Post
            </Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close report sheet"
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

          {/* Subtitle / Prompt */}
          <Text
            style={[
              styles.subtitleText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {authorName
              ? `Why are you reporting this post by ${authorName}?`
              : "Why are you reporting this post?"}
          </Text>

          {/* Reasons List */}
          <View style={styles.actionList}>
            {POST_REPORT_REASONS.map((reasonItem) => (
              <TouchableOpacity
                key={reasonItem.value}
                onPress={() => onSelectReason(reasonItem.value)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Report as ${reasonItem.label}`}
                style={[
                  globalStyles.row,
                  styles.actionRow,
                  { borderBottomColor: theme.colors.outlineVariant },
                ]}
              >
                <Text
                  style={[
                    styles.actionText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {reasonItem.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
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
  actionList: {
    marginTop: 4,
  },
  actionRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: "space-between",
  },
  actionText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

