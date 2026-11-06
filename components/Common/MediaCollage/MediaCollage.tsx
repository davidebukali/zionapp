import React from "react";
import { StyleSheet, View } from "react-native";

import { MediaCollageProps } from "./types";
import { MediaCollageControls } from "./MediaCollageControls";
import { MediaCollageGrid } from "./MediaCollageGrid";

export function MediaCollage({
  items,
  onEdit,
  onRemoveAll,
  onPressItem,
  borderRadius = 18,
  containerStyle,
}: MediaCollageProps) {
  if (!items || items.length === 0) return null;

  const hasControls = Boolean(onEdit || onRemoveAll);

  return (
    <View
      style={[
        styles.collageContainer,
        hasControls ? { marginTop: 16 } : null,
        { borderRadius },
        containerStyle,
      ]}
    >
      <MediaCollageControls onEdit={onEdit} onRemoveAll={onRemoveAll} />

      <MediaCollageGrid
        items={items}
        borderRadius={borderRadius}
        onPressItem={onPressItem}
        onEdit={onEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  collageContainer: {
    position: "relative",
    overflow: "hidden",
  },
});

