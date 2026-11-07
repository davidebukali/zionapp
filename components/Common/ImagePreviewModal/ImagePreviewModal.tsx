import React, { useCallback, useState } from "react";
import { Dimensions, FlatList, Modal, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useImageGalleryModal } from "../../../hooks/useImageGalleryModal";
import { saveImageToDevice } from "../../../utils/mediaDownloader";
import { ImagePreviewHeader } from "./ImagePreviewHeader";
import { ImagePreviewPagination } from "./ImagePreviewPagination";
import { ImagePreviewSlide } from "./ImagePreviewSlide";
import { ImagePreviewModalProps } from "./types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const ImagePreviewModal = React.memo(function ImagePreviewModal({
  images,
  imageUrl,
  initialIndex = 0,
  visible,
  onClose,
  enableDownload = true,
  onDownload,
}: ImagePreviewModalProps) {
  const insets = useSafeAreaInsets();
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownloadCurrent = useCallback(async () => {
    const currentUrl = resolvedImages[activeIndex];
    if (!currentUrl || isDownloading) return;

    try {
      setIsDownloading(true);
      if (onDownload) {
        await onDownload(currentUrl);
      } else {
        await saveImageToDevice(currentUrl);
      }
    } finally {
      setIsDownloading(false);
    }
  }, [activeIndex, isDownloading, onDownload, resolvedImages]);

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
          onDownload={enableDownload ? handleDownloadCurrent : undefined}
          isDownloading={isDownloading}
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
});

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

