import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import { useSelector } from "react-redux";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";

import { globalStyles } from "../../assets/styles/theme";
import { RootState } from "../../store/store";

const MAX_CHARACTERS = 3000;
const MAX_MEDIA = 10;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface MediaItem {
  uri: string;
  type: "image" | "video";
}

export default function NewPostScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [content, setContent] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  const user = useSelector((state: RootState) => state.auth.user);

  const getInitials = () => {
    if (user?.name) {
      const parts = user.name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "AR";
  };

  const handleClose = () => {
    if (content.trim().length > 0 || mediaItems.length > 0) {
      Alert.alert(
        "Discard post?",
        "Your draft will be lost if you leave.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const pickMedia = async () => {
    if (mediaItems.length >= MAX_MEDIA) {
      Alert.alert("Limit Reached", `You can attach up to ${MAX_MEDIA} media items.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Photo library access is needed to add photos and videos to your post."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      selectionLimit: MAX_MEDIA - mediaItems.length,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newItems: MediaItem[] = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type === "video" ? "video" : "image",
      }));
      setMediaItems((prev) => [...prev, ...newItems].slice(0, MAX_MEDIA));
    }
  };

  const handleRemoveAllMedia = () => {
    setMediaItems([]);
  };

  const handleDeleteReviewItem = () => {
    setMediaItems((prev) => {
      const updated = prev.filter((_, idx) => idx !== reviewIndex);
      if (updated.length === 0) {
        setIsReviewModalVisible(false);
        setReviewIndex(0);
      } else if (reviewIndex >= updated.length) {
        setReviewIndex(updated.length - 1);
      }
      return updated;
    });
  };

  const openReviewModal = (initialIndex = 0) => {
    setReviewIndex(initialIndex);
    setIsReviewModalVisible(true);
  };

  const remainingChars = MAX_CHARACTERS - content.length;

  const renderMediaThumbnail = (item: MediaItem, index: number, isOverlay = false, overlayCount = 0) => {
    return (
      <View style={styles.thumbnailWrapper} key={`${item.uri}-${index}`}>
        <Image source={{ uri: item.uri }} style={styles.thumbnailImage} resizeMode="cover" />
        {item.type === "video" && (
          <View style={styles.videoIndicator}>
            <Ionicons name="play" size={14} color="#FFFFFF" />
          </View>
        )}
        {isOverlay && (
          <View style={styles.moreOverlay}>
            <Text style={styles.moreOverlayText}>+{overlayCount}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCollage = () => {
    if (mediaItems.length === 0) return null;

    return (
      <View style={styles.collageContainer}>
        {/* Floating Controls: Edit & Clear All */}
        <View style={styles.collageControls}>
          <TouchableOpacity
            style={[styles.collageControlBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => openReviewModal(0)}
            activeOpacity={0.8}
            accessibilityLabel="Edit attached media"
          >
            <Ionicons name="pencil" size={16} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.collageControlBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={handleRemoveAllMedia}
            activeOpacity={0.8}
            accessibilityLabel="Remove all attached media"
          >
            <Ionicons name="close" size={18} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => openReviewModal(0)}
          style={styles.collagePressable}
        >
          {mediaItems.length === 1 && (
            <View style={styles.singleMediaContainer}>
              {renderMediaThumbnail(mediaItems[0], 0)}
            </View>
          )}

          {mediaItems.length === 2 && (
            <View style={styles.twoMediaContainer}>
              {renderMediaThumbnail(mediaItems[0], 0)}
              {renderMediaThumbnail(mediaItems[1], 1)}
            </View>
          )}

          {mediaItems.length === 3 && (
            <View style={styles.threeMediaContainer}>
              <View style={styles.heroColumn}>
                {renderMediaThumbnail(mediaItems[0], 0)}
              </View>
              <View style={styles.stackedColumn}>
                {renderMediaThumbnail(mediaItems[1], 1)}
                {renderMediaThumbnail(mediaItems[2], 2)}
              </View>
            </View>
          )}

          {mediaItems.length >= 4 && (
            <View style={styles.multiMediaContainer}>
              <View style={styles.heroColumn}>
                {renderMediaThumbnail(mediaItems[0], 0)}
              </View>
              <View style={styles.stackedColumn}>
                {renderMediaThumbnail(mediaItems[1], 1)}
                {renderMediaThumbnail(
                  mediaItems[2],
                  2,
                  mediaItems.length > 3,
                  mediaItems.length - 3
                )}
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      style={[
        globalStyles.screen,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={handleClose}
          style={[
            styles.closeButton,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={22} color={theme.colors.onSurface} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
          New post
        </Text>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Post"
          style={[
            styles.postButton,
            {
              backgroundColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
            },
          ]}
          activeOpacity={0.8}
        >
          <Text style={[styles.postButtonText, { color: theme.colors.onPrimary }]}>
            Post
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Author Row (Avatar only) */}
          <View style={styles.authorRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          </View>

          {/* Main Multiline Composer */}
          <TextInput
            multiline
            placeholder="What is happening?"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={content}
            onChangeText={setContent}
            maxLength={MAX_CHARACTERS}
            style={[
              styles.input,
              { color: theme.colors.onBackground },
            ]}
          />

          {/* Dynamic Media Collage */}
          {renderCollage()}
        </ScrollView>

        {/* Bottom Action Toolbar */}
        <View
          style={[
            styles.toolbar,
            {
              backgroundColor: theme.colors.background,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <View style={styles.actionGroup}>
            <TouchableOpacity
              accessibilityLabel="Add media from gallery"
              style={styles.actionIconButton}
              onPress={pickMedia}
              activeOpacity={0.7}
            >
              <Ionicons
                name="image-outline"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityLabel="Mention"
              style={styles.actionIconButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name="at-outline"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityLabel="Add emoji"
              style={styles.actionIconButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name="happy-outline"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.charCounter,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {remainingChars}
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* Full-Screen Media Review Modal */}
      <Modal
        visible={isReviewModalVisible}
        animationType="fade"
        onRequestClose={() => setIsReviewModalVisible(false)}
        statusBarTranslucent
      >
        <View style={[styles.reviewModalContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          {/* Modal Header */}
          <View style={styles.reviewModalHeader}>
            <TouchableOpacity
              onPress={() => setIsReviewModalVisible(false)}
              style={styles.reviewModalCloseBtn}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.reviewModalCounter}>
              {mediaItems.length > 0 ? `${reviewIndex + 1} / ${mediaItems.length}` : ""}
            </Text>

            <View style={styles.reviewModalActions}>
              <TouchableOpacity
                onPress={handleDeleteReviewItem}
                style={styles.reviewDeleteBtn}
                accessibilityLabel="Delete item"
              >
                <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsReviewModalVisible(false)}
                style={styles.reviewDoneBtn}
              >
                <Text style={styles.reviewDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Swipeable Media Pager */}
          <FlatList
            data={mediaItems}
            keyExtractor={(item, index) => `${item.uri}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={reviewIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setReviewIndex(newIndex);
            }}
            renderItem={({ item }) => (
              <View style={[styles.reviewPage, { width: SCREEN_WIDTH }]}>
                <Image source={{ uri: item.uri }} style={styles.reviewFullImage} resizeMode="contain" />
                {item.type === "video" && (
                  <View style={styles.reviewVideoOverlay}>
                    <Ionicons name="play-circle" size={64} color="rgba(255, 255, 255, 0.85)" />
                  </View>
                )}
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  postButton: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  input: {
    fontSize: 18,
    lineHeight: 26,
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: 4,
  },
  collageContainer: {
    marginTop: 16,
    position: "relative",
    borderRadius: 18,
    overflow: "hidden",
  },
  collageControls: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    flexDirection: "row",
    gap: 8,
  },
  collageControlBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  collagePressable: {
    borderRadius: 18,
    overflow: "hidden",
  },
  singleMediaContainer: {
    width: "100%",
    height: 240,
    borderRadius: 18,
    overflow: "hidden",
  },
  twoMediaContainer: {
    width: "100%",
    height: 200,
    flexDirection: "row",
    gap: 6,
    borderRadius: 18,
    overflow: "hidden",
  },
  threeMediaContainer: {
    width: "100%",
    height: 230,
    flexDirection: "row",
    gap: 6,
    borderRadius: 18,
    overflow: "hidden",
  },
  multiMediaContainer: {
    width: "100%",
    height: 240,
    flexDirection: "row",
    gap: 6,
    borderRadius: 18,
    overflow: "hidden",
  },
  heroColumn: {
    flex: 1.3,
    height: "100%",
  },
  stackedColumn: {
    flex: 1,
    height: "100%",
    gap: 6,
  },
  thumbnailWrapper: {
    flex: 1,
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  videoIndicator: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  moreOverlayText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  actionIconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  charCounter: {
    fontSize: 14,
    fontWeight: "500",
  },
  reviewModalContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  reviewModalHeader: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  reviewModalCloseBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewModalCounter: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  reviewModalActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  reviewDeleteBtn: {
    padding: 6,
  },
  reviewDoneBtn: {
    backgroundColor: "#DE3A3A",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  reviewDoneText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  reviewPage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewFullImage: {
    width: "100%",
    height: "100%",
  },
  reviewVideoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
