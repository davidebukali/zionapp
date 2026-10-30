import React from "react";
import { Image, ImageSourcePropType, Text, View } from "react-native";
import { Card, useTheme } from "react-native-paper";

import { globalStyles, postTokens } from "../../../assets/styles/theme";

interface PostCardBodyProps {
  body?: string;
  imageUrl?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  imageSource?: ImageSourcePropType;
}

export function PostCardBody({
  body,
  imageUrl,
  mediaWidth,
  mediaHeight,
  imageSource,
}: PostCardBodyProps) {
  const theme = useTheme();
  const mediaSource = imageSource ?? (imageUrl ? { uri: imageUrl } : undefined);

  // Adaptive aspect ratio clamped between 4:5 (0.8 portrait) and 16:9 (1.78 landscape)
  const rawRatio =
    mediaWidth && mediaHeight ? mediaWidth / mediaHeight : postTokens.imageAspectRatio;
  const clampedAspectRatio = Math.max(0.8, Math.min(1.78, rawRatio));

  return (
    <>
      {body ? (
        <Card.Content
          style={[
            globalStyles.postBodyContent,
            mediaSource ? { paddingBottom: 12 } : null,
          ]}
        >
          <Text style={[globalStyles.postBodyText, { color: theme.colors.onSurface }]}>
            {body}
          </Text>
        </Card.Content>
      ) : null}

      {mediaSource ? (
        <View style={{ width: "100%", overflow: "hidden" }}>
          <Image
            source={mediaSource}
            style={{
              width: "100%",
              aspectRatio: clampedAspectRatio,
            }}
            resizeMode="cover"
          />
        </View>
      ) : null}
    </>
  );
}

