import React, { useCallback, useState } from "react";
import { View } from "react-native";

import {
  canCopyMessage,
  canReportMessage,
} from "../../../features/messages/utils";
import { MESSAGE_REPORT_REASONS } from "../../../features/messages/constants";
import { ReportReason } from "../../../features/messages/types";
import {
  BottomSheet,
  BottomSheetActionRow,
  ReportReasonList,
} from "../../Common/BottomSheet";
import { QuickReactionBar } from "./QuickReactionBar";
import { ChatMessageActionSheetProps } from "./types";

export const ChatMessageActionSheet = React.memo(
  function ChatMessageActionSheet({
    message,
    onClose,
    onReact,
    onOpenReactionPicker,
    onCopy,
    onReport,
    onDelete,
  }: ChatMessageActionSheetProps) {
    const [isReporting, setIsReporting] = useState(false);

    const handleClose = useCallback(() => {
      setIsReporting(false);
      onClose();
    }, [onClose]);

    if (!message) {
      return null;
    }

    const showCopy = canCopyMessage(message);
    const showReport = canReportMessage(message);

    const handleSelectEmoji = (emoji: string) => {
      handleClose();
      onReact(message.id, emoji);
    };

    const handlePressMore = () => {
      handleClose();
      onOpenReactionPicker(message.id);
    };

    const handleCopy = () => {
      handleClose();
      onCopy(message);
    };

    const handleDelete = () => {
      handleClose();
      onDelete(message);
    };

    const handleSelectReportReason = (reason: ReportReason) => {
      handleClose();
      onReport(message, reason);
    };

    return (
      <BottomSheet
        visible={Boolean(message)}
        onClose={handleClose}
        title={isReporting ? "Report Message" : undefined}
        closeAccessibilityLabel={
          isReporting ? "Close report options" : "Close message options"
        }
      >
        {isReporting ? (
          <ReportReasonList
            reasons={MESSAGE_REPORT_REASONS}
            onSelectReason={handleSelectReportReason}
          />
        ) : (
          <View>
            {/* Quick Reactions Bar */}
            <QuickReactionBar
              onSelectEmoji={handleSelectEmoji}
              onPressMore={handlePressMore}
            />

            {/* Copy Text */}
            {showCopy && (
              <BottomSheetActionRow
                icon="copy-outline"
                label="Copy Text"
                onPress={handleCopy}
                accessibilityLabel="Copy message text"
              />
            )}

            {/* Report Message (Incoming only) */}
            {showReport && (
              <BottomSheetActionRow
                icon="flag-outline"
                label="Report Message"
                showChevron
                onPress={() => setIsReporting(true)}
                accessibilityLabel="Report message"
              />
            )}

            {/* Delete Message */}
            <BottomSheetActionRow
              icon="trash-outline"
              label="Delete Message"
              destructive
              showDivider={false}
              onPress={handleDelete}
              accessibilityLabel="Delete message"
            />
          </View>
        )}
      </BottomSheet>
    );
  }
);

