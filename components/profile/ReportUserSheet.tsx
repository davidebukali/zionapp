import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useGetUserReportReasonsQuery } from "../../features/users/api";
import { STATIC_USER_REPORT_REASONS } from "../../features/users/utils";
import { ReportReasonId } from "../../features/users/types";
import { BottomSheet } from "../Common/BottomSheet";

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
    <BottomSheet
      visible={visible}
      onClose={handleResetAndClose}
      title={`Report @${username}`}
      subtitle="Select a reason that best describes the issue"
      closeAccessibilityLabel="Close report sheet"
      backdropAccessibilityLabel="Dismiss report sheet"
      keyboardAvoiding
      sheetStyle={styles.sheetContainer}
    >
      {/* Reasons List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isReasonsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
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
                      isSelected ? "radio-button-on" : "radio-button-off"
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
          <ActivityIndicator size="small" color="#FFFFFF" />
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
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    maxHeight: "85%",
    paddingHorizontal: 20,
  },
  scrollView: {
    maxHeight: 380,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  reasonCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1.5,
  },
  reasonRadio: {
    marginRight: 12,
    marginTop: 2,
  },
  reasonTextContainer: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  reasonDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  descriptionSection: {
    marginTop: 8,
    marginBottom: 12,
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
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    minHeight: 72,
    textAlignVertical: "top",
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
