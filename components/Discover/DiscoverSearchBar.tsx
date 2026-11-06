import React from "react";
import { SearchBar } from "../Common/SearchBar";
import { DiscoverSearchBarProps } from "./types";

export function DiscoverSearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = "Search people, churches, ministries...",
}: DiscoverSearchBarProps) {
  return (
    <SearchBar
      value={value}
      onChangeText={onChangeText}
      onClear={onClear}
      placeholder={placeholder}
      containerStyle={{
        minHeight: 48,
        borderRadius: 24,
      }}
    />
  );
}

export default DiscoverSearchBar;
