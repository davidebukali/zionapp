import React from "react";

import { BottomSheet, ReportReasonList } from "../../Common/BottomSheet";
import { POST_REPORT_REASONS } from "./constants";
import { ReportPostSheetProps } from "./types";

export const ReportPostSheet = React.memo(function ReportPostSheet({
  visible,
  authorName,
  onClose,
  onSelectReason,
}: ReportPostSheetProps) {
  const subtitle = authorName
    ? `Why are you reporting this post by ${authorName}?`
    : "Why are you reporting this post?";

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Report Post"
      subtitle={subtitle}
      closeAccessibilityLabel="Close report sheet"
      backdropAccessibilityLabel="Dismiss report sheet"
    >
      <ReportReasonList
        reasons={POST_REPORT_REASONS}
        onSelectReason={onSelectReason}
      />
    </BottomSheet>
  );
});
