import { useMemo } from "react";
import { useGetAccountTypesQuery } from "../features/users/api";
import {
  DEFAULT_ORGANIZATION_CATEGORIES,
  DEFAULT_PERSONAL_CATEGORIES,
} from "../components/Common/AccountClassification/constants";

/**
 * Custom hook providing dynamically fetched categories for Personal and Organization accounts
 * from GET /api/v1/account-types, with instant fallback to standard categories if offline or loading.
 */
export function useAccountTypes() {
  const { data, isLoading, isError, refetch } = useGetAccountTypesQuery();

  const { personalCategories, organizationCategories } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        personalCategories: [...DEFAULT_PERSONAL_CATEGORIES],
        organizationCategories: [...DEFAULT_ORGANIZATION_CATEGORIES],
      };
    }

    const personalGroup = data.find((group) => group.type === "personal");
    const organizationGroup = data.find((group) => group.type === "organization");

    return {
      personalCategories:
        personalGroup?.categories && personalGroup.categories.length > 0
          ? personalGroup.categories
          : [...DEFAULT_PERSONAL_CATEGORIES],
      organizationCategories:
        organizationGroup?.categories && organizationGroup.categories.length > 0
          ? organizationGroup.categories
          : [...DEFAULT_ORGANIZATION_CATEGORIES],
    };
  }, [data]);

  return {
    personalCategories,
    organizationCategories,
    isLoading,
    isError,
    refetch,
  };
}

