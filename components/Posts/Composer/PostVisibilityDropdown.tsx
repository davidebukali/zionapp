import React, { useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

import { PostVisibility } from "../../../features/posts/types";

export interface PostVisibilityDropdownProps {
  value: PostVisibility;
  onChange: (value: PostVisibility) => void;
  disabled?: boolean;
}

interface AnchorLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function PostVisibilityDropdown({
  value,
  onChange,
  disabled = false,
}: PostVisibilityDropdownProps) {
  const theme = useTheme();
  const buttonRef = useRef<View>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState<AnchorLayout | null>(null);

  const isPublic = value === "public";
  const activeIcon = isPublic ? "globe-outline" : "people-outline";
  const activeLabel = isPublic ? "Everyone" : "Followers";

  const handleOpen = () => {
    if (disabled) return;
    let didMeasure = false;
    buttonRef.current?.measureInWindow?.((x, y, width, height) => {
      didMeasure = true;
      setAnchor({ x, y, width, height });
      setIsOpen(true);
    });
    if (!didMeasure) {
      setAnchor({ x: 16, y: 60, width: 100, height: 32 });
      setIsOpen(true);
    }
  };

  const handleSelect = (nextValue: PostVisibility) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  const pillBgColor = theme.dark
    ? "rgba(186, 26, 26, 0.16)"
    : "rgba(186, 26, 26, 0.08)";

  return (
    <View collapsable={false}>
      {/* Visibility Pill Button */}
      <TouchableOpacity
        ref={buttonRef}
        onPress={handleOpen}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Audience: ${activeLabel}`}
        accessibilityHint="Opens a menu to change who can see this post"
        style={[
          styles.pill,
          {
            backgroundColor: pillBgColor,
            borderColor: theme.colors.outlineVariant,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <Ionicons name={activeIcon} size={14} color={theme.colors.primary} />
        <Text style={[styles.pillText, { color: theme.colors.primary }]}>
          {activeLabel}
        </Text>
        <Ionicons
          name="chevron-down"
          size={12}
          color={theme.colors.primary}
          style={styles.chevron}
        />
      </TouchableOpacity>

      {/* Floating Popover Menu */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
        statusBarTranslucent
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Dismiss audience menu"
        >
          {anchor && (
            <View
              style={[
                styles.popover,
                {
                  top: anchor.y + anchor.height + 6,
                  left: Math.max(16, anchor.x),
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.outlineVariant,
                  shadowColor: theme.colors.shadow,
                },
              ]}
              onStartShouldSetResponder={() => true}
            >
              {/* Option 1: Everyone */}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Everyone"
                style={[
                  styles.menuItem,
                  { borderBottomColor: theme.colors.outlineVariant },
                ]}
                onPress={() => handleSelect("public")}
              >
                <Ionicons
                  name="globe-outline"
                  size={18}
                  color={isPublic ? theme.colors.primary : theme.colors.onSurface}
                  style={styles.menuIcon}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    {
                      color: isPublic
                        ? theme.colors.primary
                        : theme.colors.onSurface,
                      fontWeight: isPublic ? "700" : "500",
                    },
                  ]}
                >
                  Everyone
                </Text>
                {isPublic && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={theme.colors.primary}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>

              {/* Option 2: Followers */}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Followers"
                style={styles.menuItem}
                onPress={() => handleSelect("followers")}
              >
                <Ionicons
                  name="people-outline"
                  size={18}
                  color={!isPublic ? theme.colors.primary : theme.colors.onSurface}
                  style={styles.menuIcon}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    {
                      color: !isPublic
                        ? theme.colors.primary
                        : theme.colors.onSurface,
                      fontWeight: !isPublic ? "700" : "500",
                    },
                  ]}
                >
                  Followers
                </Text>
                {!isPublic && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={theme.colors.primary}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    alignSelf: "flex-start",
  },
  pillText: {
    fontSize: 13,
    fontWeight: "700",
  },
  chevron: {
    marginLeft: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  popover: {
    position: "absolute",
    minWidth: 160,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
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
    flex: 1,
  },
  checkIcon: {
    marginLeft: 8,
  },
});
