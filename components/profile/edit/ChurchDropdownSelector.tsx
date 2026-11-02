import React, { useMemo, useState } from "react";
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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { useGetChurchesQuery } from "../../../features/users/api";
import { Church } from "../../../features/users/types";
import { ChurchDropdownSelectorProps } from "./types";

export function ChurchDropdownSelector({
  selectedChurchId,
  initialChurch,
  onSelectChurch,
}: ChurchDropdownSelectorProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: churches = [],
    isLoading,
    isError,
    error,
  } = useGetChurchesQuery(searchQuery ? { search: searchQuery } : undefined);

  React.useEffect(() => {
    if (isError && error) {
      console.warn("[ChurchDropdownSelector] Error fetching churches:", error);
    }
  }, [isError, error]);

  const selectedChurch = useMemo(() => {
    if (initialChurch && initialChurch.id === selectedChurchId) {
      return initialChurch;
    }
    return churches.find((c) => c.id === selectedChurchId) || initialChurch || null;
  }, [churches, selectedChurchId, initialChurch]);

  const handleChoose = (church: Church) => {
    onSelectChurch(church);
    setModalVisible(false);
  };

  const handleClear = () => {
    onSelectChurch(null);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text
        style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}
      >
        Church Affiliation
      </Text>

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Select church"
        style={[
          styles.selectorButton,
          {
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: theme.colors.outlineVariant,
          },
        ]}
      >
        <View style={styles.selectorLeft}>
          <MaterialCommunityIcons
            name="church"
            size={18}
            color={
              selectedChurch
                ? theme.colors.primary
                : theme.colors.onSurfaceVariant
            }
            style={{ marginRight: 10 }}
          />
          <Text
            style={[
              styles.selectorText,
              {
                color: selectedChurch
                  ? theme.colors.onSurface
                  : theme.colors.onSurfaceVariant,
              },
            ]}
            numberOfLines={1}
          >
            {selectedChurch ? selectedChurch.name : "Select your church (optional)"}
          </Text>
        </View>

        <Ionicons
          name="chevron-down"
          size={18}
          color={theme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>

      {/* Modal Picker */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setModalVisible(false)}
        >
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
            <View style={styles.dragHandle} />

            <View style={styles.modalHeader}>
              <Text
                style={[styles.modalTitle, { color: theme.colors.onSurface }]}
              >
                Select Church
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
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
                style={{ marginRight: 8 }}
              />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search churches by name or location..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
                style={[
                  styles.searchInput,
                  { color: theme.colors.onSurface },
                ]}
                autoCorrect={false}
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

            {/* Clear Selection Option */}
            {selectedChurchId && (
              <TouchableOpacity
                onPress={handleClear}
                style={styles.clearOption}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={styles.clearOptionText}>
                  Remove church affiliation
                </Text>
              </TouchableOpacity>
            )}

            {/* List */}
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
                  {searchQuery ? "No churches found." : "No churches available."}
                </Text>
              </View>
            ) : (
              <FlatList
                data={churches}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = item.id === selectedChurchId;
                  return (
                    <TouchableOpacity
                      onPress={() => handleChoose(item)}
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
                      <View style={{ flex: 1 }}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectorText: {
    fontSize: 14,
    flex: 1,
  },
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
  churchName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  churchLocation: {
    fontSize: 12,
  },
});

