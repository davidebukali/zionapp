import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "react-native-paper";

import {
  AccountClassificationBottomSheetProps,
  AccountClassificationType,
} from "./types";
import {
  DEFAULT_ORGANIZATION_CATEGORIES,
  DEFAULT_PERSONAL_CATEGORIES,
} from "./constants";
import { ClassificationOptionCard } from "./ClassificationOptionCard";
import { BottomSheet } from "../BottomSheet";

export function AccountClassificationBottomSheet({
  visible,
  initialAccountType,
  initialCategory,
  onClose,
  onConfirm,
  personalCategories = DEFAULT_PERSONAL_CATEGORIES as unknown as string[],
  organizationCategories = DEFAULT_ORGANIZATION_CATEGORIES as unknown as string[],
}: AccountClassificationBottomSheetProps) {
  const theme = useTheme();

  const [selectedType, setSelectedType] =
    useState<AccountClassificationType>(initialAccountType || "personal");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || null
  );

  // Sync state when opened with initial values
  useEffect(() => {
    if (visible) {
      setSelectedType(initialAccountType || "personal");
      setSelectedCategory(initialCategory || null);
    }
  }, [visible, initialAccountType, initialCategory]);

  const handleSelectType = (type: AccountClassificationType) => {
    setSelectedType(type);
    const activeList =
      type === "personal" ? personalCategories : organizationCategories;
    if (selectedCategory && !activeList.includes(selectedCategory)) {
      setSelectedCategory(null);
    }
  };

  const isConfirmDisabled = !selectedCategory;

  const handleConfirm = () => {
    if (!selectedCategory) return;
    onConfirm(selectedType, selectedCategory);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Account Type"
      subtitle="Select your identity on Tsiyon. This classification determines your badges and discovery category."
      closeAccessibilityLabel="Close"
      sheetStyle={styles.sheetContainer}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Card 1: Personal Account */}
        <ClassificationOptionCard
          type="personal"
          title="Personal Account"
          description="For individuals, believers, pastors, elders, leaders, and teachers."
          iconName="person"
          isSelected={selectedType === "personal"}
          onSelect={() => handleSelectType("personal")}
          categories={personalCategories}
          selectedCategory={
            selectedType === "personal" ? selectedCategory : null
          }
          onSelectCategory={setSelectedCategory}
          subCategoryLabel="Select specific role:"
        />

        {/* Card 2: Church or Ministry Account */}
        <ClassificationOptionCard
          type="organization"
          title="Organization"
          description="For local congregations, fellowships, non-profits, businesses, and colleges."
          iconName="church"
          isSelected={selectedType === "organization"}
          onSelect={() => handleSelectType("organization")}
          categories={organizationCategories}
          selectedCategory={
            selectedType === "organization" ? selectedCategory : null
          }
          onSelectCategory={setSelectedCategory}
          subCategoryLabel="Select specific category:"
          hasVerifiedBadge
        />
      </ScrollView>

      {/* Action Button */}
      <TouchableOpacity
        onPress={handleConfirm}
        disabled={isConfirmDisabled}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Confirm Classification"
        style={[
          styles.confirmButton,
          {
            backgroundColor: isConfirmDisabled
              ? theme.dark
                ? "rgba(255, 255, 255, 0.12)"
                : "rgba(0, 0, 0, 0.12)"
              : theme.colors.primary,
          },
        ]}
      >
        <Text
          style={[
            styles.confirmButtonText,
            {
              color: isConfirmDisabled
                ? theme.colors.onSurfaceDisabled
                : "#FFFFFF",
            },
          ]}
        >
          Confirm
        </Text>
      </TouchableOpacity>

      <Text
        style={[
          styles.footerCaption,
          { color: theme.colors.onSurfaceVariant },
        ]}
      >
        You can adjust your community role anytime in Edit Profile
      </Text>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    paddingHorizontal: 16,
    maxHeight: "85%",
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 16,
  },
  confirmButton: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  footerCaption: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 10,
  },
});
