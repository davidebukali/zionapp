import React from "react";
import { TabItem, Tabs } from "../Common/Tabs";
import { ProfileTabsProps, ProfileTabType } from "./types";

const TABS: Array<TabItem<ProfileTabType>> = [
  { key: "posts", label: "Posts" },
  { key: "likes", label: "Likes" },
  { key: "reposts", label: "Reposts" },
  { key: "bookmarks", label: "Bookmarks" },
];

export function ProfileTabs({ activeTab, onSelectTab }: ProfileTabsProps) {
  return (
    <Tabs
      tabs={TABS}
      activeTab={activeTab}
      onSelectTab={onSelectTab}
    />
  );
}
