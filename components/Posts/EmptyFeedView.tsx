import React, { useEffect, useCallback } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useTheme } from "react-native-paper";
import { globalStyles } from "../../assets/styles/theme";
import { PrimaryButton } from "../PrimaryButton";

interface EmptyFeedViewProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function EmptyFeedView({
  onRefresh,
  isRefreshing = false,
}: EmptyFeedViewProps) {
  const router = useRouter();
  const theme = useTheme();

  // Magnetic compass needle rotation animation
  const rotation = useSharedValue(0);

  const triggerMagneticSpin = useCallback(() => {
    // Spins fast, overshoots, oscillates like a real magnetic needle settling north
    rotation.value = 0;
    rotation.value = withSequence(
      withTiming(720 + 35, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      }),
      withSpring(720 - 18, { damping: 4, stiffness: 120 }),
      withSpring(720 + 8, { damping: 5, stiffness: 140 }),
      withSpring(720, { damping: 6, stiffness: 160 })
    );
  }, [rotation]);

  useEffect(() => {
    triggerMagneticSpin();
  }, [triggerMagneticSpin]);

  // Re-trigger needle spin on refresh
  useEffect(() => {
    if (isRefreshing) {
      triggerMagneticSpin();
    }
  }, [isRefreshing, triggerMagneticSpin]);

  const compassAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const handleNavigateDiscover = () => {
    router.push("/(app)/(tabs)/discover");
  };

  return (
    <ScrollView
      contentContainerStyle={[globalStyles.scrollContent, styles.scrollCenter]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        ) : undefined
      }
    >
      <View style={[globalStyles.fullWidth, styles.contentContainer]}>
        {/* Animated Compass Icon */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={triggerMagneticSpin}
          style={[
            styles.compassCircle,
            {
              backgroundColor: theme.dark
                ? "rgba(222, 58, 58, 0.12)"
                : "rgba(222, 58, 58, 0.08)",
              borderColor: theme.dark
                ? "rgba(222, 58, 58, 0.25)"
                : "rgba(222, 58, 58, 0.18)",
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Spin compass"
        >
          <Animated.View style={compassAnimatedStyle}>
            <Ionicons
              name="compass-outline"
              size={64}
              color={theme.colors.primary}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Heading */}
        <Text
          style={[
            styles.title,
            { color: theme.colors.onSurface },
          ]}
        >
          Your feed is empty
        </Text>

        {/* Explanatory Message */}
        <Text
          style={[
            styles.description,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          You aren't following any accounts yet. Discover interesting topics to start seeing posts here!
        </Text>

        {/* Discover Action Button */}
        <PrimaryButton
          title="Discover"
          onPress={handleNavigateDiscover}
          style={globalStyles.buttonHalf}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollCenter: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  contentContainer: {
    maxWidth: 380,
    alignItems: "center",
    justifyContent: "center",
  },
  compassCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 36,
  },
});

export default EmptyFeedView;
