import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "react-native-paper";
import { globalStyles, postTokens } from "../../assets/styles/theme";

export function PostCardSkeleton() {
  const theme = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, {
        duration: 900,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const placeholderColor = theme.dark
    ? "rgba(255, 255, 255, 0.09)"
    : "rgba(0, 0, 0, 0.07)";

  return (
    <Animated.View style={[globalStyles.fullWidth, styles.card, animatedStyle]}>
      {/* Header with avatar and 2 name lines */}
      <View style={styles.headerRow}>
        <View style={[styles.avatar, { backgroundColor: placeholderColor }]} />
        <View style={styles.headerTextCol}>
          <View
            style={[
              styles.headerLine1,
              { backgroundColor: placeholderColor },
            ]}
          />
          <View
            style={[
              styles.headerLine2,
              { backgroundColor: placeholderColor },
            ]}
          />
        </View>
      </View>

      {/* Body text lines */}
      <View style={styles.bodyBlock}>
        <View
          style={[
            globalStyles.fullWidth,
            styles.textLineFull,
            { backgroundColor: placeholderColor },
          ]}
        />
        <View
          style={[
            styles.textLineShort,
            { backgroundColor: placeholderColor },
          ]}
        />
      </View>

      {/* Large media card block */}
      <View
        style={[
          globalStyles.fullWidth,
          styles.mediaBlock,
          { backgroundColor: placeholderColor },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 16,
  },
  headerTextCol: {
    justifyContent: "center",
  },
  headerLine1: {
    width: 130,
    height: 15,
    borderRadius: 7,
    marginBottom: 8,
  },
  headerLine2: {
    width: 85,
    height: 12,
    borderRadius: 6,
  },
  bodyBlock: {
    marginTop: 16,
  },
  textLineFull: {
    height: 14,
    borderRadius: 7,
    marginBottom: 10,
  },
  textLineShort: {
    width: "76%",
    height: 14,
    borderRadius: 7,
  },
  mediaBlock: {
    aspectRatio: postTokens.imageAspectRatio,
    borderRadius: 22,
    marginTop: 18,
  },
});

export default PostCardSkeleton;
