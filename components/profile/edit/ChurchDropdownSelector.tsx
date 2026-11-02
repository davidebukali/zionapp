import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { Church } from "../../../features/users/types";
import { ChurchDropdownSelectorProps } from "./types";
import { ChurchPickerModal } from "./ChurchPickerModal";

export function ChurchDropdownSelector({
  selectedChurchId,
  initialChurch,
  onSelectChurch,
}: ChurchDropdownSelectorProps) {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentChurch, setCurrentChurch] = useState<Church | null>(
    initialChurch || null
  );

  // Keep locally selected church in sync
  const displayChurchName = useMemo(() => {
    if (currentChurch && currentChurch.id === selectedChurchId) {
      return currentChurch.name;
    }
    if (initialChurch && initialChurch.id === selectedChurchId) {
      return initialChurch.name;
    }
    return null;
  }, [currentChurch, initialChurch, selectedChurchId]);

  const handleSelect = (church: Church | null) => {
    setCurrentChurch(church);
    onSelectChurch(church);
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
              displayChurchName
                ? theme.colors.primary
                : theme.colors.onSurfaceVariant
            }
            style={styles.churchIcon}
          />
          <Text
            style={[
              styles.selectorText,
              {
                color: displayChurchName
                  ? theme.colors.onSurface
                  : theme.colors.onSurfaceVariant,
              },
            ]}
            numberOfLines={1}
          >
            {displayChurchName || "Select your church (optional)"}
          </Text>
        </View>

        <Ionicons
          name="chevron-down"
          size={18}
          color={theme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>

      <ChurchPickerModal
        visible={modalVisible}
        selectedChurchId={selectedChurchId}
        onSelectChurch={handleSelect}
        onClose={() => setModalVisible(false)}
      />
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
  churchIcon: {
    marginRight: 10,
  },
  selectorText: {
    fontSize: 14,
    flex: 1,
  },
});
