import React from "react";
import { Image, StyleSheet, View } from "react-native";

export interface ChatPostCardImageProps {
  imageUrl?: string;
}

export const ChatPostCardImage = React.memo(
  function ChatPostCardImage({ imageUrl }: ChatPostCardImageProps) {
    if (!imageUrl) {
      return null;
    }

    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.headerImage}
          resizeMode="cover"
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  imageContainer: {
    width: "100%",
    height: 130,
    overflow: "hidden",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
});

