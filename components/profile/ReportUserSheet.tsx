import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useGetUserReportReasonsQuery } from "../../features/users/api";
import { STATIC_USER_REPORT_REASONS } from "../../features/users/utils";
import { ReportReasonId } from "../../features/users/types";

export interface ReportUserSheetProps {
  visible: boolean;
  username: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReasonId, description: string) => void;
}

export function ReportUserSheet({
  visible,
  username,
  isSubmitting = false,
  onClose,
  onSubmit,
}: ReportUserSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { data: apiReasons, isLoading: isReasonsLoading } =
    useGetUserReportReasonsQuery(undefined, {
      skip: !visible,
    });

  const reasons =
    apiReasons && apiReasons.length > 0
      ? apiReasons
      : STATIC_USER_REPORT_REASONS;

  const [selectedReasonId, setSelectedReasonId] =
    useState<ReportReasonId | null>(null);
  const [descriptionText, setDescriptionText] = useState("");

  const handleResetAndClose = () => {
    setSelectedReasonId(null);
    setDescriptionText("");
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedReasonId) return;
    onSubmit(selectedReasonId, descriptionText.trim());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleResetAndClose}
      statusBarTranslucent
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: theme.colors.backdrop }]}
        onPress={handleResetAndClose}
        accessibilityRole="button"
        accessibilityLabel="Dismiss report sheet"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoid}
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
                { backgroundColor: theme.colors.outlineVariant },
              ]}
            />

            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.headerTitleGroup}>
                <Text
                  style={[styles.sheetTitle, { color: theme.colors.onSurface }]}
                >
                  Report @{username}
                </Text>
                <Text
                  style={[
                    styles.sheetSubtitle,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Select a reason that best describes the issue
                </Text>
              </View>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close report sheet"
                style={[
                  styles.closeButton,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
                onPress={handleResetAndClose}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>

            {/* Reasons List */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {isReasonsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                  />
                </View>
              ) : (
                reasons.map((item) => {
                  const isSelected = selectedReasonId === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Select reason: ${item.label}`}
                      style={[
                        styles.reasonCard,
                        {
                          backgroundColor: isSelected
                            ? theme.dark
                              ? "rgba(222, 58, 58, 0.12)"
                              : "rgba(222, 58, 58, 0.08)"
                            : theme.colors.surfaceVariant,
                          borderColor: isSelected
                            ? theme.colors.primary
                            : "transparent",
                        },
                      ]}
                      onPress={() => setSelectedReasonId(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.reasonRadio}>
                        <Ionicons
                          name={
                            isSelected
                              ? "radio-button-on"
                              : "radio-button-off"
                          }
                          size={20}
                          color={
                            isSelected
                              ? theme.colors.primary
                              : theme.colors.onSurfaceVariant
                          }
                        />
                      </View>
                      <View style={styles.reasonTextContainer}>
                        <Text
                          style={[
                            styles.reasonLabel,
                            {
                              color: isSelected
                                ? theme.colors.primary
                                : theme.colors.onSurface,
                            },
                          ]}
                        >
                          {item.label}
                        </Text>
                        <Text
                          style={[
                            styles.reasonDesc,
                            { color: theme.colors.onSurfaceVariant },
                          ]}
                        >
                          {item.desc}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}

              {/* Optional Description */}
              {selectedReasonId ? (
                <View style={styles.descriptionSection}>
                  <View style={styles.descriptionHeaderRow}>
                    <Text
                      style={[
                        styles.descriptionLabel,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      Additional details (optional)
                    </Text>
                    <Text
                      style={[
                        styles.charCounter,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {descriptionText.length}/1000
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      styles.descriptionInput,
                      {
                        backgroundColor: theme.colors.surfaceVariant,
                        color: theme.colors.onSurface,
                        borderColor: theme.colors.outlineVariant,
                      },
                    ]}
                    placeholder="Provide any additional context for our team..."
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    value={descriptionText}
                    onChangeText={setDescriptionText}
                    maxLength={1000}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              ) : null}
            </ScrollView>

            {/* Submit Button */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Submit report"
              style={[
                styles.submitButton,
                {
                  backgroundColor: selectedReasonId
                    ? theme.colors.primary
                    : theme.colors.surfaceVariant,
                },
              ]}
              disabled={!selectedReasonId || isSubmitting}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={[
                    styles.submitButtonText,
                    {
                      color: selectedReasonId
                        ? "#FFFFFF"
                        : theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  Submit Report
                </Text>
              )}
            </TouchableOpacity>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitleGroup: {
    flex: 1,
    marginRight: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sheetSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    maxHeight: 400,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  reasonCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  reasonRadio: {
    marginRight: 12,
  },
  reasonTextContainer: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  reasonDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  descriptionSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  descriptionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  descriptionLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  charCounter: {
    fontSize: 12,
  },
  descriptionInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: "top",
  },
  submitButton: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
