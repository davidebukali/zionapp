import React, { useCallback, useState } from "react";
import {
  LayoutAnimation,
  NativeSyntheticEvent,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextLayoutEventData,
  TextStyle,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface ExpandableTextProps {
  text: string;
  maxLines?: number;
  isTruncationEnabled?: boolean;
  onPressText?: () => void;
  readMoreText?: string;
  showLessText?: string;
  textStyle?: StyleProp<TextStyle>;
  actionStyle?: StyleProp<TextStyle>;
  onToggleExpand?: (expanded: boolean) => void;
}

export function ExpandableText({
  text,
  maxLines = 3,
  isTruncationEnabled = true,
  onPressText,
  readMoreText = "Read more",
  showLessText = "Show less",
  textStyle,
  actionStyle,
  onToggleExpand,
}: ExpandableTextProps) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncatable, setIsTruncatable] = useState<boolean>(() => {
    return text.split("\n").length > maxLines;
  });

  const handleTextLayout = useCallback(
    (event: NativeSyntheticEvent<TextLayoutEventData>) => {
      if (!isTruncatable && event.nativeEvent.lines.length > maxLines) {
        setIsTruncatable(true);
      }
    },
    [isTruncatable, maxLines]
  );

  const handleToggleExpand = useCallback(() => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch {
      // Graceful fallback if LayoutAnimation is unsupported in testing environments
    }
    setIsExpanded((previousExpandedState) => {
      const nextExpandedState = !previousExpandedState;
      onToggleExpand?.(nextExpandedState);
      return nextExpandedState;
    });
  }, [onToggleExpand]);

  const shouldClampText = isTruncationEnabled && !isExpanded;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        disabled={!onPressText}
        onPress={onPressText}
        activeOpacity={0.8}
        accessibilityRole={onPressText ? "button" : undefined}
        accessibilityLabel={onPressText ? "View post details" : undefined}
      >
        <Text
          numberOfLines={shouldClampText ? maxLines : undefined}
          onTextLayout={isTruncationEnabled ? handleTextLayout : undefined}
          style={textStyle}
        >
          {text}
        </Text>
      </TouchableOpacity>

      {isTruncationEnabled && isTruncatable ? (
        <TouchableOpacity
          onPress={handleToggleExpand}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? showLessText : readMoreText}
          style={styles.actionTouchable}
        >
          <Text
            style={[
              styles.actionLabel,
              { color: theme.colors.primary },
              actionStyle,
            ]}
          >
            {isExpanded ? showLessText : readMoreText}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  actionTouchable: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingVertical: 2,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});
