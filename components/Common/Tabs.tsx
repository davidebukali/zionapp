import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "react-native-paper";

export interface TabItem<TKey extends string = string> {
  key: TKey;
  label: string;
}

export interface TabsProps<TKey extends string = string> {
  tabs: Array<TabItem<TKey>>;
  activeTab: TKey;
  onSelectTab: (tabKey: TKey) => void;
  style?: StyleProp<ViewStyle>;
  tabButtonStyle?: StyleProp<ViewStyle>;
  tabLabelStyle?: StyleProp<TextStyle>;
  activeIndicatorStyle?: StyleProp<ViewStyle>;
}

function TabsInner<TKey extends string = string>({
  tabs,
  activeTab,
  onSelectTab,
  style,
  tabButtonStyle,
  tabLabelStyle,
  activeIndicatorStyle,
}: TabsProps<TKey>) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderBottomColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${tab.label} tab`}
            onPress={() => onSelectTab(tab.key)}
            style={[styles.tabButton, tabButtonStyle]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive
                    ? theme.colors.onBackground
                    : theme.colors.onSurfaceVariant,
                  fontWeight: isActive ? "800" : "600",
                },
                tabLabelStyle,
              ]}
            >
              {tab.label}
            </Text>

            {isActive && (
              <View
                style={[
                  styles.activeIndicator,
                  { backgroundColor: theme.colors.primary },
                  activeIndicatorStyle,
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export const Tabs = React.memo(TabsInner) as <TKey extends string = string>(
  props: TabsProps<TKey>
) => React.ReactElement | null;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: "100%",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    position: "relative",
  },
  tabLabel: {
    fontSize: 15,
    letterSpacing: 0.1,
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 8,
    right: 8,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});

