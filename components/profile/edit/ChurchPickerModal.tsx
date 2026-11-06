import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useDebounce } from "../../../hooks/useDebounce";
import { useGetChurchesQuery } from "../../../features/users/api";
import { Church } from "../../../features/users/types";
import { ChurchPickerModalProps } from "./types";

export function ChurchPickerModal({
  visible,
  selectedChurchId,
  onSelectChurch,
  onClose,
}: ChurchPickerModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery);

  // Reset search when modal closes
  useEffect(() => {
    if (!visible) {
      setSearchQuery("");
    }
  }, [visible]);

  // Query is skipped while modal is closed
  const {
    data: churches = [],
    isLoading,
    isError,
    error,
  } = useGetChurchesQuery(
    debouncedSearch.trim() ? { search: debouncedSearch.trim() } : undefined,
    { skip: !visible }
  );

  useEffect(() => {
    if (isError && error) {
      console.warn("[ChurchPickerModal] Error fetching churches:", error);
    }
  }, [isError, error]);

  const handleSelect = (church: Church) => {
    onSelectChurch(church);
    onClose();
  };

  const handleRemove = () => {
    onSelectChurch(null);
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
            styles.modalSheet,
            {
              backgroundColor: theme.colors.surface,
              paddingBottom: Math.max(insets.bottom + 16, 24),
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Top Handle */}
          <View style={styles.dragHandle} />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text
              style={[styles.modalTitle, { color: theme.colors.onSurface }]}
            >
              Select Church
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

          {/* Search Bar */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.outlineVariant,
              },
            ]}
          >
            <Ionicons
              name="search"
              size={16}
              color={theme.colors.onSurfaceVariant}
              style={styles.searchIcon}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search churches by name or location..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              style={[styles.searchInput, { color: theme.colors.onSurface }]}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {Boolean(searchQuery) && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Clear Affiliation Button */}
          {Boolean(selectedChurchId) && (
            <TouchableOpacity
              onPress={handleRemove}
              accessibilityRole="button"
              accessibilityLabel="Remove church affiliation"
              style={styles.clearOption}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <Text style={styles.clearOptionText}>
                Remove church affiliation
              </Text>
            </TouchableOpacity>
          )}

          {/* Church List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
              />
            </View>
          ) : churches.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {debouncedSearch
                  ? "No churches found."
                  : "No churches available."}
              </Text>
            </View>
          ) : (
            <FlatList
              data={churches}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = item.id === selectedChurchId;
                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                    style={[
                      styles.churchItem,
                      {
                        borderBottomColor: theme.colors.outlineVariant,
                        backgroundColor: isSelected
                          ? "rgba(186, 26, 26, 0.1)"
                          : "transparent",
                      },
                    ]}
                  >
                    <View style={styles.itemTextContainer}>
                      <Text
                        style={[
                          styles.churchName,
                          {
                            color: isSelected
                              ? theme.colors.primary
                              : theme.colors.onSurface,
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                      {Boolean(item.location) && (
                        <Text
                          style={[
                            styles.churchLocation,
                            { color: theme.colors.onSurfaceVariant },
                          ]}
                        >
                          {item.location}
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          )}
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
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    maxHeight: "80%",
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignSelf: "center",
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 6,
    marginBottom: 6,
  },
  clearOptionText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "600",
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 13,
  },
  churchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemTextContainer: {
    flex: 1,
  },
  churchName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  churchLocation: {
    fontSize: 12,
  },
});

