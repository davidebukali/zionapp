import React from "react";
import { View } from "react-native";

import { ReportReasonListProps } from "./types";
import { BottomSheetActionRow } from "./BottomSheetActionRow";

export function ReportReasonList<TReason extends string = string>({
  reasons,
  onSelectReason,
}: ReportReasonListProps<TReason>) {
  return (
    <View>
      {reasons.map((reasonOption, index) => {
        const isLastItem = index === reasons.length - 1;
        return (
          <BottomSheetActionRow
            key={reasonOption.value}
            label={reasonOption.label}
            onPress={() => onSelectReason(reasonOption.value)}
            showChevron
            showDivider={!isLastItem}
            accessibilityLabel={`Report as ${reasonOption.label}`}
          />
        );
      })}
    </View>
  );
}

