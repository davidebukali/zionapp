import React from "react";
import {
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
} from "react-native";
import { useKeyboardVisible } from "../../hooks/useKeyboardVisible";

export type KeyboardAvoidingContainerProps = Omit<
  KeyboardAvoidingViewProps,
  "behavior"
> & {
  behavior?: KeyboardAvoidingViewProps["behavior"];
};

export function KeyboardAvoidingContainer({
  behavior = "padding",
  enabled,
  children,
  ...restProps
}: KeyboardAvoidingContainerProps) {
  const isKeyboardVisible = useKeyboardVisible();
  const isAvoidingEnabled =
    enabled !== undefined
      ? enabled
      : Platform.OS === "ios" || isKeyboardVisible;

  return (
    <KeyboardAvoidingView
      behavior={behavior}
      enabled={isAvoidingEnabled}
      {...restProps}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
