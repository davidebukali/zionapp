import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AccountClassificationBottomSheetProps,
  AccountClassificationType,
} from "./types";
import {
  DEFAULT_ORGANIZATION_CATEGORIES,
  DEFAULT_PERSONAL_CATEGORIES,
} from "./constants";
import { ClassificationOptionCard } from "./ClassificationOptionCard";

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
  const insets = useSafeAreaInsets();

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
    const activeList = type === "personal" ? personalCategories : organizationCategories;
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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheetContainer,
            {
              backgroundColor: theme.colors.surface,
              paddingBottom: Math.max(insets.bottom + 16, 24),
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text
              style={[styles.sheetTitle, { color: theme.colors.onSurface }]}
            >
              Account Type
            </Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="close"
                size={22}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.sheetSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Select your identity on Tsiyon. This classification determines your badges and discovery
            category.
          </Text>

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
              selectedCategory={selectedType === "personal" ? selectedCategory : null}
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
              selectedCategory={selectedType === "organization" ? selectedCategory : null}
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
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    maxHeight: "85%",
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignSelf: "center",
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sheetSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 16,
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
