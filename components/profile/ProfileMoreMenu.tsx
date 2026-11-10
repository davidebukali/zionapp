import React from "react";
import {
  Dimensions,
  Modal,
  Pressable,
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

export interface ProfileMoreMenuProps {
  visible: boolean;
  anchorPosition: AnchorPosition | null;
  username: string;
  isBlocked?: boolean;
  onClose: () => void;
  onPressBlockToggle?: () => void;
  onPressReport?: () => void;
}

const MENU_WIDTH = 220;

export function ProfileMoreMenu({
  visible,
  anchorPosition,
  username,
  isBlocked = false,
  onClose,
  onPressBlockToggle,
  onPressReport,
}: ProfileMoreMenuProps) {
  const theme = useTheme();

  if (!visible) return null;

  const windowDimensions = Dimensions.get("window");

  // Position calculation relative to anchor
  let topPosition = 80;
  let rightPosition = 16;

  if (anchorPosition) {
    topPosition = anchorPosition.y + anchorPosition.height + 6;
    rightPosition = Math.max(
      16,
      windowDimensions.width - (anchorPosition.x + anchorPosition.width)
    );
  }

  const handleAction = (callback?: () => void) => {
    onClose();
    callback?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Dismiss menu"
      >
        <View
          style={[
            styles.popover,
            {
              top: topPosition,
              right: rightPosition,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outlineVariant,
              shadowColor: theme.colors.shadow,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          {/* Block / Unblock Option */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={isBlocked ? `Unblock @${username}` : `Block @${username}`}
            style={[
              styles.menuItem,
              { borderBottomColor: theme.colors.outlineVariant },
            ]}
            onPress={() => handleAction(onPressBlockToggle)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isBlocked ? "shield-checkmark-outline" : "ban-outline"}
              size={19}
              color={isBlocked ? theme.colors.primary : theme.colors.error}
              style={styles.menuIcon}
            />
            <Text
              style={[
                styles.menuItemText,
                { color: isBlocked ? theme.colors.primary : theme.colors.error },
              ]}
              numberOfLines={1}
            >
              {isBlocked ? `Unblock @${username}` : `Block @${username}`}
            </Text>
          </TouchableOpacity>

          {/* Report Option */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Report @${username}`}
            style={styles.menuItem}
            onPress={() => handleAction(onPressReport)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="flag-outline"
              size={19}
              color={theme.colors.onSurface}
              style={styles.menuIcon}
            />
            <Text
              style={[
                styles.menuItemText,
                { color: theme.colors.onSurface },
              ]}
              numberOfLines={1}
            >
              {`Report @${username}`}
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  popover: {
    position: "absolute",
    width: MENU_WIDTH,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 4,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
});

