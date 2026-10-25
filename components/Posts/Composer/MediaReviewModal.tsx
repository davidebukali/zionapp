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
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../../../assets/styles/theme";
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
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={[
          globalStyles.screen,
          {
            backgroundColor: "#000000",
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* Header */}
        <View style={[globalStyles.row, { height: 54, paddingHorizontal: 16 }]}>
          <TouchableOpacity
            onPress={onClose}
            style={globalStyles.postIconButton}
            accessibilityLabel="Close media review"
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text
            style={[
              globalStyles.postActionText,
              { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
            ]}
          >
            {items.length > 0 ? `${currentIndex + 1} / ${items.length}` : ""}
          </Text>

          <View style={[globalStyles.postActionGroup, { gap: 14 }]}>
            <TouchableOpacity
              onPress={onDeleteItem}
              style={globalStyles.postIconButton}
              accessibilityLabel="Delete item"
            >
              <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: theme.colors.primary,
                paddingHorizontal: 16,
                paddingVertical: 7,
                borderRadius: 16,
              }}
            >
              <Text style={[globalStyles.primaryButtonText, { fontSize: 14 }]}>
                Done
              </Text>
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
              <Image
                source={{ uri: item.uri }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
