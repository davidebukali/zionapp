import React, { useCallback } from "react";
import { Dimensions, FlatList, Modal, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useImageGalleryModal } from "../../../hooks/useImageGalleryModal";
import { ImagePreviewHeader } from "./ImagePreviewHeader";
import { ImagePreviewPagination } from "./ImagePreviewPagination";
import { ImagePreviewSlide } from "./ImagePreviewSlide";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface PostImagePreviewModalProps {
  images?: string[];
  imageUrl?: string | null;
  initialIndex?: number;
  visible?: boolean;
  onClose: () => void;
}

export const PostImagePreviewModal = React.memo(
  function PostImagePreviewModal({
    images,
    imageUrl,
    initialIndex = 0,
    visible,
    onClose,
  }: PostImagePreviewModalProps) {
    const insets = useSafeAreaInsets();
    const {
      resolvedImages,
      isVisible,
      activeIndex,
      flatListRef,
      handleMomentumScrollEnd,
      getItemLayout,
    } = useImageGalleryModal({
      images,
      imageUrl,
      initialIndex,
      visible,
    });

    const renderItem = useCallback(
      ({ item }: { item: string }) => <ImagePreviewSlide uri={item} />,
      []
    );

    if (!isVisible || resolvedImages.length === 0) return null;

    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.backdrop}>
          <ImagePreviewHeader
            currentIndex={activeIndex}
            totalCount={resolvedImages.length}
            topInset={insets.top}
            onClose={onClose}
          />

          <FlatList
            ref={flatListRef}
            data={resolvedImages}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            getItemLayout={getItemLayout}
            initialScrollIndex={
              initialIndex >= 0 && initialIndex < resolvedImages.length
                ? initialIndex
                : 0
            }
            style={styles.gallery}
          />

          <ImagePreviewPagination
            currentIndex={activeIndex}
            totalCount={resolvedImages.length}
            bottomInset={insets.bottom}
          />
        </View>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  gallery: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
});
