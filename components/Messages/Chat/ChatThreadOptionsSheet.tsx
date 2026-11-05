import React, { useState } from "react";
import {
  Modal,
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
import { ReportReason } from "../../../features/messages/types";
import { ChatThreadOptionsSheetProps } from "./types";

const REPORT_REASONS: { label: string; value: ReportReason }[] = [
  { label: "Spam or Scam", value: "spam" },
  { label: "Harassment or Bullying", value: "harassment" },
  { label: "Hate Speech", value: "hate_speech" },
  { label: "Inappropriate Content", value: "inappropriate_content" },
  { label: "Violence or Dangerous", value: "violence" },
  { label: "Other", value: "other" },
];

export const ChatThreadOptionsSheet = React.memo(
  function ChatThreadOptionsSheet({
    visible,
    participant,
    isMuted,
    isArchived,
    isBlocked,
    onClose,
    onToggleMute,
    onToggleArchive,
    onClearHistory,
    onReport,
    onToggleBlock,
  }: ChatThreadOptionsSheetProps) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [isReporting, setIsReporting] = useState(false);

    const handleClose = () => {
      setIsReporting(false);
      onClose();
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: theme.colors.backdrop }]}
          onPress={handleClose}
        >
          <Pressable
            style={[
              styles.sheetContainer,
              {
                backgroundColor: theme.colors.surface,
                paddingBottom: Math.max(insets.bottom + 12, 24),
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <View
              style={[
                styles.dragHandle,
                { backgroundColor: theme.colors.outline },
              ]}
            />

            {/* Title / Header */}
            <View style={[globalStyles.row, styles.headerRow]}>
              <Text
                style={[
                  globalStyles.commentsHeaderTitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                {isReporting ? "Report Conversation" : participant.name || "Conversation"}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                accessibilityRole="button"
                accessibilityLabel="Close options"
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

            {isReporting ? (
              // Report reasons list
              <View style={styles.actionList}>
                {REPORT_REASONS.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    onPress={() => {
                      setIsReporting(false);
                      onReport(item.value);
                    }}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Report as ${item.label}`}
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
                      {item.label}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              // Main Actions List
              <View style={styles.actionList}>
                {/* 1. Mute / Unmute */}
                <TouchableOpacity
                  onPress={onToggleMute}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={isMuted ? "Unmute notifications" : "Mute notifications"}
                  style={[
                    globalStyles.row,
                    styles.actionRow,
                    { borderBottomColor: theme.colors.outlineVariant },
                  ]}
                >
                  <View style={globalStyles.row}>
                    <Ionicons
                      name={isMuted ? "notifications-outline" : "notifications-off-outline"}
                      size={22}
                      color={theme.colors.onSurface}
                      style={styles.actionIcon}
                    />
                    <Text
                      style={[
                        styles.actionText,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      {isMuted ? "Unmute Notifications" : "Mute Notifications"}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 2. Archive / Unarchive */}
                <TouchableOpacity
                  onPress={onToggleArchive}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={isArchived ? "Unarchive conversation" : "Archive conversation"}
                  style={[
                    globalStyles.row,
                    styles.actionRow,
                    { borderBottomColor: theme.colors.outlineVariant },
                  ]}
                >
                  <View style={globalStyles.row}>
                    <Ionicons
                      name="archive-outline"
                      size={22}
                      color={theme.colors.onSurface}
                      style={styles.actionIcon}
                    />
                    <Text
                      style={[
                        styles.actionText,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      {isArchived ? "Unarchive Conversation" : "Archive Conversation"}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 3. Report */}
                <TouchableOpacity
                  onPress={() => setIsReporting(true)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Report conversation"
                  style={[
                    globalStyles.row,
                    styles.actionRow,
                    { borderBottomColor: theme.colors.outlineVariant },
                  ]}
                >
                  <View style={globalStyles.row}>
                    <Ionicons
                      name="flag-outline"
                      size={22}
                      color={theme.colors.onSurface}
                      style={styles.actionIcon}
                    />
                    <Text
                      style={[
                        styles.actionText,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      Report Conversation
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={theme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>

                {/* 4. Clear History */}
                <TouchableOpacity
                  onPress={onClearHistory}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Clear chat history"
                  style={[
                    globalStyles.row,
                    styles.actionRow,
                    { borderBottomColor: theme.colors.outlineVariant },
                  ]}
                >
                  <View style={globalStyles.row}>
                    <Ionicons
                      name="trash-outline"
                      size={22}
                      color={theme.colors.error}
                      style={styles.actionIcon}
                    />
                    <Text
                      style={[styles.actionText, { color: theme.colors.error }]}
                    >
                      Clear Chat History
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 5. Block / Unblock User */}
                <TouchableOpacity
                  onPress={onToggleBlock}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={isBlocked ? "Unblock user" : "Block user"}
                  style={[
                    globalStyles.row,
                    styles.actionRow,
                    { borderBottomColor: "transparent" },
                  ]}
                >
                  <View style={globalStyles.row}>
                    <Ionicons
                      name="ban-outline"
                      size={22}
                      color={isBlocked ? theme.colors.onSurface : theme.colors.error}
                      style={styles.actionIcon}
                    />
                    <Text
                      style={[
                        styles.actionText,
                        { color: isBlocked ? theme.colors.onSurface : theme.colors.error },
                      ]}
                    >
                      {isBlocked
                        ? `Unblock ${participant.name || "User"}`
                        : `Block ${participant.name || "User"}`}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    );
  }
);

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
    paddingBottom: 8,
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
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

