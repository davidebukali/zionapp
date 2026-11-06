import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface UseImageGalleryModalOptions {
  images?: string[];
  imageUrl?: string | null;
  initialIndex?: number;
  visible?: boolean;
}

export interface UseImageGalleryModalResult {
  resolvedImages: string[];
  isVisible: boolean;
  activeIndex: number;
  flatListRef: React.RefObject<FlatList<string>>;
  handleMomentumScrollEnd: (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => void;
  getItemLayout: (
    data: any,
    index: number
  ) => { length: number; offset: number; index: number };
}

export function useImageGalleryModal({
  images,
  imageUrl,
  initialIndex = 0,
  visible,
}: UseImageGalleryModalOptions): UseImageGalleryModalResult {
  const flatListRef = useRef<FlatList<string>>(null);

  const resolvedImages = useMemo(() => {
    if (images && images.length > 0) return images;
    if (imageUrl) return [imageUrl];
    return [];
  }, [images, imageUrl]);

  const isVisible =
    visible !== undefined
      ? visible
      : Boolean(imageUrl || (images && images.length > 0));

  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (isVisible) {
      const targetIndex =
        initialIndex >= 0 && initialIndex < resolvedImages.length
          ? initialIndex
          : 0;
      setActiveIndex(targetIndex);

      const timeoutId = setTimeout(() => {
        try {
          flatListRef.current?.scrollToIndex({
            index: targetIndex,
            animated: false,
          });
        } catch {
          // Layout not ready or single item
        }
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [initialIndex, isVisible, resolvedImages.length]);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newIndex = Math.round(
        event.nativeEvent.contentOffset.x / SCREEN_WIDTH
      );
      if (newIndex >= 0 && newIndex < resolvedImages.length) {
        setActiveIndex(newIndex);
      }
    },
    [resolvedImages.length]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    []
  );

  return {
    resolvedImages,
    isVisible,
    activeIndex,
    flatListRef,
    handleMomentumScrollEnd,
    getItemLayout,
  };
}

