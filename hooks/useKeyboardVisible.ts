import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

export function useKeyboardVisible(): boolean {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEventName =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEventName =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener?.(showEventName, () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener?.(hideEventName, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription?.remove?.();
      hideSubscription?.remove?.();
    };
  }, []);

  return isKeyboardVisible;
}
