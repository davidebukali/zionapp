import React from "react";
import { View } from "react-native";
import { globalStyles } from "../../assets/styles/theme";
import PostCardSkeleton from "./PostCardSkeleton";

interface PostFeedSkeletonProps {
  count?: number;
}

export function PostFeedSkeleton({ count = 2 }: PostFeedSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <View style={globalStyles.feedContainer}>
      {items.map((key) => (
        <PostCardSkeleton key={key} />
      ))}
    </View>
  );
}

export default PostFeedSkeleton;
