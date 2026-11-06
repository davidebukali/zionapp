import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface ImagePreviewSlideProps {
  uri: string;
}

export const ImagePreviewSlide = React.memo(function ImagePreviewSlide({
  uri,
}: ImagePreviewSlideProps) {
  return (
    <View style={styles.slide}>
      <Image source={{ uri }} style={styles.image} resizeMode="contain" />
    </View>
  );
});

const styles = StyleSheet.create({
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
});

