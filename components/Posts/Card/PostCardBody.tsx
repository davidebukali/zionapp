import React from "react";
import { Image, ImageSourcePropType, Text, TouchableOpacity, View } from "react-native";
import { Card, useTheme } from "react-native-paper";

import { globalStyles, postTokens } from "../../../assets/styles/theme";
import { LaravelMedia } from "../../../features/posts/types";
import { MediaCollage } from "../Composer/MediaCollage";

interface PostCardBodyProps {
  body?: string;
  imageUrl?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  media?: LaravelMedia[];
  imageSource?: ImageSourcePropType;
  onPressBody?: () => void;
  onPressImage?: () => void;
  onPressImageIndex?: (index: number) => void;
}

export function PostCardBody({
  body,
  imageUrl,
  mediaWidth,
  mediaHeight,
  media,
  imageSource,
  onPressBody,
  onPressImage,
  onPressImageIndex,
}: PostCardBodyProps) {
  const theme = useTheme();

  const isMultiMedia = Boolean(media && media.length > 1);
  const singleMedia = media && media.length === 1 ? media[0] : undefined;

  const resolvedImageUrl = singleMedia?.url ?? imageUrl;
  const mediaSource = imageSource ?? (resolvedImageUrl ? { uri: resolvedImageUrl } : undefined);

  const resolvedWidth = singleMedia?.width ?? mediaWidth;
  const resolvedHeight = singleMedia?.height ?? mediaHeight;

  // Adaptive aspect ratio clamped between 4:5 (0.8 portrait) and 16:9 (1.78 landscape)
  const rawRatio =
    resolvedWidth && resolvedHeight ? resolvedWidth / resolvedHeight : postTokens.imageAspectRatio;
  const clampedAspectRatio = Math.max(0.8, Math.min(1.78, rawRatio));

  const hasMedia = isMultiMedia || Boolean(mediaSource);

  return (
    <>
      {body ? (
        <TouchableOpacity
          disabled={!onPressBody}
          onPress={onPressBody}
          activeOpacity={0.8}
          accessibilityRole={onPressBody ? "button" : undefined}
          accessibilityLabel={onPressBody ? "View post details" : undefined}
        >
          <Card.Content
            style={[
              globalStyles.postBodyContent,
              hasMedia ? { paddingBottom: 12 } : null,
            ]}
          >
            <Text style={[globalStyles.postBodyText, { color: theme.colors.onSurface }]}>
              {body}
            </Text>
          </Card.Content>
        </TouchableOpacity>
      ) : null}

      {isMultiMedia && media ? (
        <View style={{ width: "100%", overflow: "hidden", paddingHorizontal: 12, paddingBottom: 8 }}>
          <MediaCollage
            items={media}
            onPressItem={onPressImageIndex ?? (onPressImage ? () => onPressImage() : onPressBody)}
            borderRadius={12}
          />
        </View>
      ) : mediaSource ? (
        <TouchableOpacity
          disabled={!onPressImage && !onPressBody && !onPressImageIndex}
          onPress={onPressImageIndex ? () => onPressImageIndex(0) : (onPressImage ?? onPressBody)}
          activeOpacity={0.85}
          style={{ width: "100%", overflow: "hidden" }}
        >
          <Image
            source={mediaSource}
            style={{
              width: "100%",
              aspectRatio: clampedAspectRatio,
            }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ) : null}
    </>
  );
}
