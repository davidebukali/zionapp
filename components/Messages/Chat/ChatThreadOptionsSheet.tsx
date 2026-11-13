import React, { useState } from "react";
import { View } from "react-native";

import { MESSAGE_REPORT_REASONS } from "../../../features/messages/constants";
import { ReportReason } from "../../../features/messages/types";
import {
  BottomSheet,
  BottomSheetActionRow,
  ReportReasonList,
} from "../../Common/BottomSheet";
import { ChatThreadOptionsSheetProps } from "./types";

export const ChatThreadOptionsSheet = React.memo(
  function ChatThreadOptionsSheet({
    visible,
    participant,
    isMuted,
    isArchived,
    isBlocked,
    isDraft = false,
    onClose,
    onToggleMute,
    onToggleArchive,
    onClearHistory,
    onReport,
    onToggleBlock,
  }: ChatThreadOptionsSheetProps) {
    const [isReporting, setIsReporting] = useState(false);

    const handleClose = () => {
      setIsReporting(false);
      onClose();
    };

    const handleSelectReportReason = (reason: ReportReason) => {
      setIsReporting(false);
      onReport(reason);
    };

    const blockLabel = isBlocked
      ? `Unblock ${participant.name || "User"}`
      : `Block ${participant.name || "User"}`;

    return (
      <BottomSheet
        visible={visible}
        onClose={handleClose}
        title={
          isReporting ? "Report Conversation" : participant.name || "Conversation"
        }
        closeAccessibilityLabel="Close options"
      >
        {isReporting ? (
          <ReportReasonList
            reasons={MESSAGE_REPORT_REASONS}
            onSelectReason={handleSelectReportReason}
          />
        ) : (
          <View>
            {/* 1. Mute / Unmute (Hidden for drafts) */}
            {!isDraft && (
              <BottomSheetActionRow
                icon={
                  isMuted
                    ? "notifications-outline"
                    : "notifications-off-outline"
                }
                label={
                  isMuted ? "Unmute Notifications" : "Mute Notifications"
                }
                accessibilityLabel={
                  isMuted
                    ? "Unmute notifications"
                    : "Mute notifications"
                }
                onPress={onToggleMute}
              />
            )}

            {/* 2. Archive / Unarchive (Hidden for drafts) */}
            {!isDraft && (
              <BottomSheetActionRow
                icon="archive-outline"
                label={
                  isArchived
                    ? "Unarchive Conversation"
                    : "Archive Conversation"
                }
                accessibilityLabel={
                  isArchived
                    ? "Unarchive conversation"
                    : "Archive conversation"
                }
                onPress={onToggleArchive}
              />
            )}

            {/* 3. Report */}
            <BottomSheetActionRow
              icon="flag-outline"
              label="Report Conversation"
              showChevron
              accessibilityLabel="Report conversation"
              onPress={() => setIsReporting(true)}
            />

            {/* 4. Clear History (Hidden for drafts) */}
            {!isDraft && (
              <BottomSheetActionRow
                icon="trash-outline"
                label="Clear Chat History"
                destructive
                accessibilityLabel="Clear chat history"
                onPress={onClearHistory}
              />
            )}

            {/* 5. Block / Unblock User */}
            <BottomSheetActionRow
              icon={isBlocked ? "shield-checkmark-outline" : "ban-outline"}
              label={blockLabel}
              destructive={!isBlocked}
              showDivider={false}
              accessibilityLabel={isBlocked ? "Unblock user" : "Block user"}
              onPress={onToggleBlock}
            />
          </View>
        )}
      </BottomSheet>
    );
  }
);
