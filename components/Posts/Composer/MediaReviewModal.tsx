import React from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import { MediaItem } from "../../../hooks/useCreatePostComposer";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface MediaReviewModalProps {
  visible: boolean;
  items: MediaItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onDeleteItem: () => void;
}

export function MediaReviewModal({
  visible,
  items,
  currentIndex,
  onIndexChange,
  onClose,
  onDeleteItem,
}: MediaReviewModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Close media review"
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.counterText}>
            {items.length > 0 ? `${currentIndex + 1} / ${items.length}` : ""}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onDeleteItem}
              style={styles.deleteButton}
              accessibilityLabel="Delete item"
            >
              <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.doneButton}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Swipeable Pager */}
        <FlatList
          data={items}
          keyExtractor={(item, index) => `${item.uri}-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={currentIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            onIndexChange(newIndex);
          }}
          renderItem={({ item }) => (
            <View style={[styles.page, { width: SCREEN_WIDTH }]}>
              <Image source={{ uri: item.uri }} style={styles.fullImage} resizeMode="contain" />
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  deleteButton: {
    padding: 6,
  },
  doneButton: {
    backgroundColor: "#DE3A3A",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  doneText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  page: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
});
