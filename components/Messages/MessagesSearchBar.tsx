import React from "react";
import { StyleSheet, View } from "react-native";
import { SearchBar } from "../Common/SearchBar";
import { MessagesSearchBarProps } from "./types";

export function MessagesSearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = "Search messages",
}: MessagesSearchBarProps) {
  return (
    <View style={styles.outerContainer}>
      <SearchBar
        value={value}
        onChangeText={onChangeText}
        onClear={onClear}
        placeholder={placeholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
