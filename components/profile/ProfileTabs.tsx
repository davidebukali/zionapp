import React from "react";
import { TabItem, Tabs } from "../Common/Tabs";
import { ProfileTabsProps, ProfileTabType } from "./types";

const ALL_TABS: Array<TabItem<ProfileTabType>> = [
  { key: "posts", label: "Posts" },
  { key: "likes", label: "Likes" },
  { key: "reposts", label: "Reposts" },
  { key: "bookmarks", label: "Bookmarks" },
];

export function ProfileTabs({
  activeTab,
  onSelectTab,
  isOwnProfile = true,
}: ProfileTabsProps) {
  const tabs = React.useMemo(() => {
    if (isOwnProfile) return ALL_TABS;
    return ALL_TABS.filter((tab) => tab.key !== "bookmarks");
  }, [isOwnProfile]);

  return (
    <Tabs
      tabs={tabs}
      activeTab={activeTab}
      onSelectTab={onSelectTab}
    />
  );
}
