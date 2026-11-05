import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { globalStyles } from "../../../assets/styles/theme";
import { MAX_CHAT_MEDIA, MAX_MESSAGE_LENGTH } from "../../../constants";
import { ChatComposerProps } from "./types";

export const ChatComposer = React.memo(function ChatComposer({
  text,
  onChangeText,
  onSend,
  onToggleEmoji,
  placeholder = "Message...",
  disabled = false,
  selectedMedia = [],
  onPickMedia,
  onRemoveMedia,
  isUploadingMedia = false,
  uploadStatusText = null,
}: ChatComposerProps) {
  const theme = useTheme();
  const hasImages = selectedMedia.length > 0;
  const canSend = !disabled && !isUploadingMedia && (Boolean(text.trim()) || hasImages);
  const canPickMore = !disabled && !isUploadingMedia && selectedMedia.length < MAX_CHAT_MEDIA;

  return (
    <View
      style={[
        globalStyles.commentComposerContainer,
        {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.outlineVariant,
        },
      ]}
    >
      {/* Thumbnail Strip (Rendered above input pill when images are selected) */}
      {hasImages && (
        <View style={styles.thumbnailContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailScroll}
          >
            {selectedMedia.map((item, index) => (
              <View key={`${item.uri}-${index}`} style={styles.thumbnailWrapper}>
                <Image
                  source={{ uri: item.uri }}
                  style={[
                    styles.thumbnailImage,
                    { borderColor: theme.colors.outlineVariant },
                  ]}
                />
                {!isUploadingMedia && onRemoveMedia && (
                  <TouchableOpacity
                    onPress={() => onRemoveMedia(index)}
                    accessibilityRole="button"
                    accessibilityLabel="Remove photo"
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={20} color="#111111" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {isUploadingMedia && (
              <View
                style={[
                  styles.uploadStatusPill,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text
                  style={[
                    styles.uploadStatusText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {uploadStatusText || "Uploading..."}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Main Composer Row */}
      <View style={globalStyles.row}>
        {/* Input Pill */}
        <View
          style={[
            globalStyles.commentComposerInputShell,
            {
              backgroundColor: theme.colors.surfaceVariant,
              marginLeft: 0,
              opacity: disabled || isUploadingMedia ? 0.6 : 1,
            },
          ]}
        >
          {/* Image Picker Trigger */}
          {onPickMedia && (
            <TouchableOpacity
              onPress={onPickMedia}
              disabled={!canPickMore}
              accessibilityRole="button"
              accessibilityLabel="Add photos"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.mediaButton, { opacity: canPickMore ? 1 : 0.4 }]}
            >
              <Ionicons
                name="image-outline"
                size={22}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          )}

          {/* Text Input (Disabled when photos are attached - no captions) */}
          <TextInput
            value={hasImages ? "" : text}
            onChangeText={onChangeText}
            editable={!disabled && !isUploadingMedia && !hasImages}
            placeholder={
              disabled
                ? "You cannot message this user."
                : hasImages
                ? "Photos ready to send (no captions)"
                : placeholder
            }
            placeholderTextColor={theme.colors.onSurfaceVariant}
            style={[
              globalStyles.commentComposerInput,
              { color: theme.colors.onSurface },
            ]}
            multiline={!hasImages}
            maxLength={MAX_MESSAGE_LENGTH}
            accessibilityLabel="Message input"
          />

          {!disabled && !hasImages && !isUploadingMedia && (
            <TouchableOpacity
              onPress={onToggleEmoji}
              accessibilityRole="button"
              accessibilityLabel="Add emoji"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.emojiButton}
            >
              <Ionicons
                name="happy-outline"
                size={22}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Send Button */}
        <TouchableOpacity
          onPress={onSend}
          disabled={!canSend}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          style={[
            globalStyles.commentSendButton,
            {
              backgroundColor: canSend
                ? theme.colors.primary
                : theme.colors.surfaceVariant,
              opacity: canSend ? 1 : 0.5,
            },
          ]}
        >
          {isUploadingMedia ? (
            <ActivityIndicator size="small" color={theme.colors.onPrimary} />
          ) : (
            <Ionicons
              name="send"
              size={17}
              color={canSend ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  thumbnailContainer: {
    paddingBottom: 8,
  },
  thumbnailScroll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  thumbnailWrapper: {
    position: "relative",
    width: 62,
    height: 62,
  },
  thumbnailImage: {
    width: 62,
    height: 62,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  removeButton: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  uploadStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  uploadStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  mediaButton: {
    marginRight: 6,
    padding: 2,
  },
  emojiButton: {
    padding: 6,
  },
});
