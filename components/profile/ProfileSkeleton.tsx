import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";

export function ProfileSkeleton() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const shimmerColor = theme.dark ? "#262626" : "#EAEAEA";

  return (
    <View style={styles.container}>
      {/* Banner Skeleton */}
      <View
        style={[
          styles.banner,
          {
            paddingTop: insets.top,
            backgroundColor: theme.dark ? "#361616" : "#F3D2D2",
          },
        ]}
      >
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: shimmerColor,
              borderColor: theme.colors.background,
            },
          ]}
        />
      </View>

      <View style={styles.belowBannerRow}>
        <View style={styles.avatarPlaceholderSpace} />
        <View
          style={[
            styles.pillPlaceholder,
            { backgroundColor: shimmerColor },
          ]}
        />
      </View>

      {/* Info Skeletons */}
      <View style={styles.infoContainer}>
        <View
          style={[
            styles.titlePlaceholder,
            { backgroundColor: shimmerColor },
          ]}
        />
        <View
          style={[
            styles.handlePlaceholder,
            { backgroundColor: shimmerColor },
          ]}
        />
        <View
          style={[
            styles.bioLine1,
            { backgroundColor: shimmerColor },
          ]}
        />
        <View
          style={[
            styles.bioLine2,
            { backgroundColor: shimmerColor },
          ]}
        />

        <View style={styles.statsPlaceholderRow}>
          <View
            style={[
              styles.statPlaceholder,
              { backgroundColor: shimmerColor },
            ]}
          />
          <View
            style={[
              styles.statPlaceholder,
              { backgroundColor: shimmerColor },
            ]}
          />
        </View>
      </View>

      {/* Tabs Skeleton */}
      <View
        style={[
          styles.tabsRow,
          { borderBottomColor: theme.colors.outlineVariant },
        ]}
      >
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.tabPlaceholder,
              { backgroundColor: shimmerColor },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  banner: {
    width: "100%",
    height: 150,
    position: "relative",
  },
  avatar: {
    position: "absolute",
    bottom: -44,
    left: 16,
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3.5,
  },
  belowBannerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    minHeight: 52,
  },
  avatarPlaceholderSpace: {
    width: 88,
  },
  pillPlaceholder: {
    width: 100,
    height: 38,
    borderRadius: 19,
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  titlePlaceholder: {
    width: 160,
    height: 22,
    borderRadius: 6,
    marginBottom: 6,
  },
  handlePlaceholder: {
    width: 100,
    height: 14,
    borderRadius: 4,
    marginBottom: 16,
  },
  bioLine1: {
    width: "90%",
    height: 14,
    borderRadius: 4,
    marginBottom: 6,
  },
  bioLine2: {
    width: "60%",
    height: 14,
    borderRadius: 4,
    marginBottom: 16,
  },
  statsPlaceholderRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 16,
  },
  statPlaceholder: {
    width: 90,
    height: 16,
    borderRadius: 4,
  },
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabPlaceholder: {
    width: 60,
    height: 14,
    borderRadius: 4,
  },
});

