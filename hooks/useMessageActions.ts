import { useCallback, useState } from "react";
import { Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";

import {
  useDeleteMessageForEveryoneMutation,
  useDeleteMessageForMeMutation,
  useReportMessageMutation,
} from "../features/messages/api";
import { ChatMessage, ReportReason } from "../features/messages/types";

export function useMessageActions(conversationId?: string | null) {
  const [actionMessage, setActionMessage] = useState<ChatMessage | null>(null);

  const [deleteMessageForEveryoneMutation] =
    useDeleteMessageForEveryoneMutation();
  const [deleteMessageForMeMutation] = useDeleteMessageForMeMutation();
  const [reportMessageMutation] = useReportMessageMutation();

  const handleOpenMessageActions = useCallback((message: ChatMessage) => {
    setActionMessage(message);
  }, []);

  const handleCloseMessageActions = useCallback(() => {
    setActionMessage(null);
  }, []);

  const handleCopyMessage = useCallback(async (message: ChatMessage) => {
    try {
      await Clipboard.setStringAsync(message.text || "");
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Clipboard or Haptics unavailable in test/web
    }
  }, []);

  const handleReportMessage = useCallback(
    async (message: ChatMessage, reason: ReportReason) => {
      try {
        await reportMessageMutation({
          id: message.id,
          reason,
        }).unwrap();

        setTimeout(() => {
          Alert.alert(
            "Report Submitted",
            "Thank you for helping keep Tsiyon safe. We will review this report."
          );
        }, 100);
      } catch {
        setTimeout(() => {
          Alert.alert("Error", "Could not submit report. Please try again.");
        }, 100);
      }
    },
    [reportMessageMutation]
  );

  const handleDeleteMessage = useCallback(
    (message: ChatMessage) => {
      const activeConversationId = conversationId || message.conversationId;
      if (!activeConversationId) return;

      setTimeout(() => {
        if (message.isOutgoing) {
          Alert.alert(
            "Delete Message?",
            "Do you want to delete this message for everyone or just for yourself?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete for me",
                style: "destructive",
                onPress: async () => {
                  try {
                    await deleteMessageForMeMutation({
                      messageId: message.id,
                      conversationId: activeConversationId,
                    }).unwrap();
                  } catch {
                    Alert.alert("Error", "Could not delete message.");
                  }
                },
              },
              {
                text: "Delete for everyone",
                style: "destructive",
                onPress: async () => {
                  try {
                    await deleteMessageForEveryoneMutation({
                      messageId: message.id,
                      conversationId: activeConversationId,
                    }).unwrap();
                  } catch {
                    Alert.alert("Error", "Could not delete message.");
                  }
                },
              },
            ]
          );
        } else {
          Alert.alert(
            "Delete Message?",
            "This will remove the message from your device.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete for me",
                style: "destructive",
                onPress: async () => {
                  try {
                    await deleteMessageForMeMutation({
                      messageId: message.id,
                      conversationId: activeConversationId,
                    }).unwrap();
                  } catch {
                    Alert.alert("Error", "Could not delete message.");
                  }
                },
              },
            ]
          );
        }
      }, 100);
    },
    [conversationId, deleteMessageForEveryoneMutation, deleteMessageForMeMutation]
  );

  return {
    actionMessage,
    handleOpenMessageActions,
    handleCloseMessageActions,
    handleCopyMessage,
    handleReportMessage,
    handleDeleteMessage,
  };
}

