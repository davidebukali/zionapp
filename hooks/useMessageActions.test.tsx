import React from "react";
import { View } from "react-native";
import ReactTestRenderer, { act } from "react-test-renderer";
import { Alert } from "react-native";
import * as Clipboard from "expo-clipboard";

import { useMessageActions } from "./useMessageActions";
import { ChatMessage } from "../features/messages/types";

const mockDeleteForEveryone = jest.fn();
const mockDeleteForMe = jest.fn();
const mockReportMessage = jest.fn();

jest.mock("../features/messages/api", () => ({
  useDeleteMessageForEveryoneMutation: () => [mockDeleteForEveryone],
  useDeleteMessageForMeMutation: () => [mockDeleteForMe],
  useReportMessageMutation: () => [mockReportMessage],
}));

jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: "light" },
}));

let capturedHook: ReturnType<typeof useMessageActions> | null = null;

function HookConsumer({ conversationId }: { conversationId?: string }) {
  const actions = useMessageActions(conversationId);
  capturedHook = actions;
  return <View />;
}

describe("useMessageActions", () => {
  const outgoingMessage: ChatMessage = {
    id: "msg-out-1",
    senderId: "user-1",
    isOutgoing: true,
    text: "Hello outgoing",
    timestamp: "10:00",
  };

  const incomingMessage: ChatMessage = {
    id: "msg-in-1",
    senderId: "user-2",
    isOutgoing: false,
    text: "Hello incoming",
    timestamp: "10:01",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    jest.useFakeTimers();
    capturedHook = null;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("manages actionMessage open and close state", () => {
    act(() => {
      ReactTestRenderer.create(<HookConsumer conversationId="conv-123" />);
    });

    expect(capturedHook!.actionMessage).toBeNull();

    act(() => {
      capturedHook!.handleOpenMessageActions(outgoingMessage);
    });
    expect(capturedHook!.actionMessage).toEqual(outgoingMessage);

    act(() => {
      capturedHook!.handleCloseMessageActions();
    });
    expect(capturedHook!.actionMessage).toBeNull();
  });

  it("copies message text to clipboard", async () => {
    act(() => {
      ReactTestRenderer.create(<HookConsumer conversationId="conv-123" />);
    });

    await act(async () => {
      await capturedHook!.handleCopyMessage(outgoingMessage);
    });

    expect(Clipboard.setStringAsync).toHaveBeenCalledWith("Hello outgoing");
  });

  it("submits message report and displays confirmation alert", async () => {
    mockReportMessage.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ success: true }),
    });

    act(() => {
      ReactTestRenderer.create(<HookConsumer conversationId="conv-123" />);
    });

    await act(async () => {
      await capturedHook!.handleReportMessage(incomingMessage, "harassment");
    });

    expect(mockReportMessage).toHaveBeenCalledWith({
      id: "msg-in-1",
      reason: "harassment",
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Report Submitted",
      expect.stringContaining("Thank you")
    );
  });

  it("prompts with both delete options for outgoing messages", () => {
    mockDeleteForEveryone.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ success: true }),
    });

    act(() => {
      ReactTestRenderer.create(<HookConsumer conversationId="conv-123" />);
    });

    act(() => {
      capturedHook!.handleDeleteMessage(outgoingMessage);
      jest.runAllTimers();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Delete Message?",
      expect.stringContaining("delete this message for everyone"),
      expect.arrayContaining([
        expect.objectContaining({ text: "Cancel" }),
        expect.objectContaining({ text: "Delete for me" }),
        expect.objectContaining({ text: "Delete for everyone" }),
      ])
    );
  });

  it("prompts with delete for me option for incoming messages", () => {
    act(() => {
      ReactTestRenderer.create(<HookConsumer conversationId="conv-123" />);
    });

    act(() => {
      capturedHook!.handleDeleteMessage(incomingMessage);
      jest.runAllTimers();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Delete Message?",
      "This will remove the message from your device.",
      expect.arrayContaining([
        expect.objectContaining({ text: "Cancel" }),
        expect.objectContaining({ text: "Delete for me" }),
      ])
    );
  });
});
