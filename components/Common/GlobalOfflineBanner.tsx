import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetworkStatus } from "../../utils/network";

export function GlobalOfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  // Track whether we were previously offline so we can flash "Back online"
  const wasOffline = useRef(false);
  const [bannerState, setBannerState] = useState<"hidden" | "offline" | "restored">("hidden");

  // Animation shared value: 0 = hidden (offscreen), 1 = visible
  const translateY = useSharedValue(-60);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (!isOnline) {
      wasOffline.current = true;
      setBannerState("offline");
      translateY.value = withSpring(0, { damping: 14, stiffness: 120 });
    } else if (wasOffline.current) {
      // Transition from offline -> online: show "Back online" briefly
      setBannerState("restored");
      timeoutId = setTimeout(() => {
        translateY.value = withTiming(-60, { duration: 350 }, (finished) => {
          if (finished) {
            wasOffline.current = false;
          }
        });
      }, 2500);
    } else {
      translateY.value = -60;
      setBannerState("hidden");
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOnline, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const isRestored = bannerState === "restored";

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { top: insets.top + 6 },
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.pill,
          isRestored ? styles.pillRestored : styles.pillOffline,
        ]}
      >
        <Ionicons
          name={isRestored ? "checkmark-circle" : "cloud-offline-outline"}
          size={18}
          color="#FFFFFF"
          style={styles.icon}
        />
        <Text style={styles.text}>
          {isRestored ? "Back online" : "No internet connection"}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  pillOffline: {
    backgroundColor: "#C53030", // Warning red pill
  },
  pillRestored: {
    backgroundColor: "#2F855A", // Recovery green pill
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});

export default GlobalOfflineBanner;
