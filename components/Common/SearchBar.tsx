import React from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";

export interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  autoFocus?: boolean;
}

export function SearchBar({
  value = "",
  onChangeText,
  onClear,
  placeholder = "Search...",
  style,
  containerStyle,
  inputStyle,
  autoFocus = false,
}: SearchBarProps) {
  const theme = useTheme();

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChangeText?.("");
    }
  };

  return (
    <View style={style}>
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.surfaceVariant },
          containerStyle,
        ]}
      >
        <Ionicons
          name="search"
          size={18}
          color={theme.colors.onSurfaceVariant}
          style={styles.searchIcon}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          style={[
            styles.input,
            { color: theme.colors.onSurface },
            inputStyle,
          ]}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          returnKeyType="search"
          accessibilityRole="search"
          accessibilityLabel={placeholder}
        />

        {value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            accessibilityRole="button"
            accessibilityLabel="Clear search text"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.clearButton}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 2,
    marginLeft: 6,
  },
});

