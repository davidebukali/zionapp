import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

export interface AnchorPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PostCardMenuProps {
  visible: boolean;
  anchorPosition: AnchorPosition | null;
  isOwnPost?: boolean;
  isFollowingAuthor?: boolean;
  onClose: () => void;
  onPressEdit?: () => void;
  onPressDelete?: () => void;
  onPressFollowToggle?: () => void;
  onPressReport?: () => void;
  onPressShareDM?: () => void;
  onPressShareSystem?: () => void;
}

const MENU_WIDTH = 220;
const ESTIMATED_HEIGHT = 160;

export function PostCardMenu({
  visible,
  anchorPosition,
  isOwnPost = false,
  isFollowingAuthor = false,
  onClose,
  onPressEdit,
  onPressDelete,
  onPressFollowToggle,
  onPressReport,
  onPressShareDM,
  onPressShareSystem,
}: PostCardMenuProps) {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<"main" | "share">("main");

  const handleClose = () => {
    setViewMode("main");
    onClose();
  };

  const handleAction = (callback?: () => void) => {
    handleClose();
    callback?.();
  };

  const handleShareSystemPress = () => {
    handleClose();
    onPressShareSystem?.();
    if (!onPressShareSystem) {
      setTimeout(async () => {
        try {
          await Share.share({
            message: "Check out this post on Zion",
            title: "Share Post",
          });
        } catch {
          // User dismissed or cancelled
        }
      }, 100);
    }
  };

  const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

  let top = 60;
  let right = 16;

  if (anchorPosition) {
    top = anchorPosition.y + anchorPosition.height + 4;
    if (top + ESTIMATED_HEIGHT > windowHeight - 20) {
      top = Math.max(16, anchorPosition.y - ESTIMATED_HEIGHT - 4);
    }
    right = Math.max(16, windowWidth - (anchorPosition.x + anchorPosition.width));
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Pressable
        style={styles.backdrop}
        onPress={handleClose}
        accessibilityRole="button"
        accessibilityLabel="Dismiss menu"
      >
        <View
          style={[
            styles.popover,
            {
              top,
              right,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outlineVariant,
              shadowColor: theme.colors.shadow,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          {viewMode === "main" ? (
            <>
              {isOwnPost ? (
                <>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Edit post"
                    style={[
                      styles.menuItem,
                      { borderBottomColor: theme.colors.outlineVariant },
                    ]}
                    onPress={() => handleAction(onPressEdit)}
                  >
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color={theme.colors.onSurface}
                      style={styles.menuIcon}
                    />
                    <Text
                      style={[styles.menuItemText, { color: theme.colors.onSurface }]}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Delete post"
                    style={[
                      styles.menuItem,
                      { borderBottomColor: theme.colors.outlineVariant },
                    ]}
                    onPress={() => handleAction(onPressDelete)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={theme.colors.error}
                      style={styles.menuIcon}
                    />
                    <Text
                      style={[styles.menuItemText, { color: theme.colors.error }]}
                    >
                      Delete
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={
                      isFollowingAuthor ? "Unfollow author" : "Follow author"
                    }
                    style={[
                      styles.menuItem,
                      { borderBottomColor: theme.colors.outlineVariant },
                    ]}
                    onPress={() => handleAction(onPressFollowToggle)}
                  >
                    <Ionicons
                      name={
                        isFollowingAuthor
                          ? "person-remove-outline"
                          : "person-add-outline"
                      }
                      size={20}
                      color={theme.colors.onSurface}
                      style={styles.menuIcon}
                    />
                    <Text
                      style={[styles.menuItemText, { color: theme.colors.onSurface }]}
                    >
                      {isFollowingAuthor ? "Unfollow" : "Follow"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Report post"
                    style={[
                      styles.menuItem,
                      { borderBottomColor: theme.colors.outlineVariant },
                    ]}
                    onPress={() => handleAction(onPressReport)}
                  >
                    <Ionicons
                      name="flag-outline"
                      size={20}
                      color={theme.colors.error}
                      style={styles.menuIcon}
                    />
                    <Text
                      style={[styles.menuItemText, { color: theme.colors.error }]}
                    >
                      Report
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Share Option */}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Share options"
                style={styles.menuItem}
                onPress={() => setViewMode("share")}
              >
                <Ionicons
                  name="share-social-outline"
                  size={20}
                  color={theme.colors.onSurface}
                  style={styles.menuIcon}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    styles.flexText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Share
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Share Sub-Flow Header */}
              <View
                style={[
                  styles.menuHeader,
                  { borderBottomColor: theme.colors.outlineVariant },
                ]}
              >
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Back to menu"
                  hitSlop={8}
                  style={styles.backButton}
                  onPress={() => setViewMode("main")}
                >
                  <Ionicons
                    name="arrow-back"
                    size={18}
                    color={theme.colors.onSurface}
                  />
                </TouchableOpacity>
                <Text
                  style={[styles.menuHeaderText, { color: theme.colors.onSurface }]}
                >
                  Share
                </Text>
              </View>

              {/* Send via Direct Message */}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Send via Direct Message"
                style={[
                  styles.menuItem,
                  { borderBottomColor: theme.colors.outlineVariant },
                ]}
                onPress={() => handleAction(onPressShareDM)}
              >
                <Ionicons
                  name="paper-plane-outline"
                  size={20}
                  color={theme.colors.onSurface}
                  style={styles.menuIcon}
                />
                <Text
                  style={[styles.menuItemText, { color: theme.colors.onSurface }]}
                >
                  Send via Direct Message
                </Text>
              </TouchableOpacity>

              {/* Share via System... */}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Share via System"
                style={styles.menuItem}
                onPress={handleShareSystemPress}
              >
                <Ionicons
                  name="share-social-outline"
                  size={20}
                  color={theme.colors.onSurface}
                  style={styles.menuIcon}
                />
                <Text
                  style={[styles.menuItemText, { color: theme.colors.onSurface }]}
                >
                  Share via System...
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  popover: {
    position: "absolute",
    width: MENU_WIDTH,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 4,
    marginRight: 6,
  },
  menuHeaderText: {
    fontSize: 14,
    fontWeight: "700",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuIcon: {
    marginRight: 10,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "500",
  },
  flexText: {
    flex: 1,
  },
});
