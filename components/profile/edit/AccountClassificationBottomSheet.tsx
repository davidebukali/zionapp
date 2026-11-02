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
import { ClassificationOptionCard } from "./ClassificationOptionCard";

export const INDIVIDUAL_CATEGORIES = [
  "Believer",
  "Pastor / Elder",
  "Worship Leader",
  "Teacher",
] as const;

export const ORGANIZATION_CATEGORIES = [
  "Local Church",
  "Non-Profit",
  "Fellowship Group",
  "Media / Publishing",
] as const;

export function AccountClassificationBottomSheet({
  visible,
  initialAccountType,
  initialCategory,
  onClose,
  onConfirm,
}: AccountClassificationBottomSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedType, setSelectedType] =
    useState<AccountClassificationType>(initialAccountType);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || INDIVIDUAL_CATEGORIES[0]
  );

  // Sync state when opened with initial values
  useEffect(() => {
    if (visible) {
      setSelectedType(initialAccountType);
      setSelectedCategory(
        initialCategory ||
          (initialAccountType === "organization"
            ? ORGANIZATION_CATEGORIES[0]
            : INDIVIDUAL_CATEGORIES[0])
      );
    }
  }, [visible, initialAccountType, initialCategory]);

  const handleSelectType = (type: AccountClassificationType) => {
    setSelectedType(type);
    if (type === "individual") {
      if (!INDIVIDUAL_CATEGORIES.includes(selectedCategory as any)) {
        setSelectedCategory(INDIVIDUAL_CATEGORIES[0]);
      }
    } else {
      if (!ORGANIZATION_CATEGORIES.includes(selectedCategory as any)) {
        setSelectedCategory(ORGANIZATION_CATEGORIES[0]);
      }
    }
  };

  const handleConfirm = () => {
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
              Account Classification
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
            Select your primary identity on Tsiyon. This classification is
            mutually exclusive and determines your badges and discovery
            category.
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Card 1: Personal Account */}
            <ClassificationOptionCard
              type="individual"
              title="Personal Account"
              description="For individual believers, families, pastors, elders, and worship leaders. Share prayer requests, testimonies, devotionals, and connect in fellowship."
              iconName="person"
              isSelected={selectedType === "individual"}
              onSelect={() => handleSelectType("individual")}
              categories={INDIVIDUAL_CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              subCategoryLabel="Select specific role:"
            />

            {/* Card 2: Church or Ministry Account */}
            <ClassificationOptionCard
              type="organization"
              title="Church or Ministry Account"
              description="For local congregations, campus fellowships, Christian non-profits, and outreach ministries. Publish events, sermons, and official updates."
              iconName="church"
              isSelected={selectedType === "organization"}
              onSelect={() => handleSelectType("organization")}
              categories={ORGANIZATION_CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              subCategoryLabel="Select specific category:"
              hasVerifiedBadge
            />
          </ScrollView>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Confirm Classification"
            style={[
              styles.confirmButton,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={styles.confirmButtonText}>
              Confirm Classification
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
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  footerCaption: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
  },
});
