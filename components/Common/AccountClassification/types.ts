export type AccountClassificationType = "personal" | "organization";

export interface AccountClassificationCardRowProps {
  accountType: AccountClassificationType | null;
  category?: string | null;
  onPressCard: (type: AccountClassificationType) => void;
  title?: string;
  subtitle?: string;
  isOptional?: boolean;
}

export interface AccountClassificationBottomSheetProps {
  visible: boolean;
  initialAccountType: AccountClassificationType | null;
  initialCategory: string | null;
  onClose: () => void;
  onConfirm: (
    accountType: AccountClassificationType,
    category: string
  ) => void;
  personalCategories?: string[];
  organizationCategories?: string[];
}

export interface ClassificationOptionCardProps {
  type: AccountClassificationType;
  title: string;
  description: string;
  iconName: "person" | "church";
  isSelected: boolean;
  onSelect: () => void;
  categories: readonly string[] | string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
  subCategoryLabel: string;
  hasVerifiedBadge?: boolean;
}

