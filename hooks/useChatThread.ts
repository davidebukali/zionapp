import { useState, useCallback, useMemo } from "react";
import { Keyboard } from "react-native";
import { router } from "expo-router";
import { EmojiType } from "rn-emoji-keyboard";

import { ChatMessage, OnlineContact } from "../features/messages/types";
import {
  MOCK_ACTIVE_CONTACTS,
  MOCK_CONVERSATIONS,
  MOCK_THREAD_MESSAGES,
} from "../features/messages/mockData";

export function useChatThread(conversationId?: string) {
  // 1. Resolve participant
  const participant: OnlineContact = useMemo(() => {
    const conv = MOCK_CONVERSATIONS.find((c) => c.id === conversationId);
    if (conv) return conv.participant;

    // Check if conversationId is a user id directly
    const directContact = MOCK_ACTIVE_CONTACTS.find(
      (c) => c.id === conversationId || `conv-new-${c.id}` === conversationId
    );
    if (directContact) return directContact;

    // Default to first contact (Maya Chen from mockup)
    return MOCK_ACTIVE_CONTACTS[0];
  }, [conversationId]);

  // 2. Resolve initial messages
  const initialMessages = useMemo(() => {
    if (conversationId && MOCK_THREAD_MESSAGES[conversationId]) {
      return MOCK_THREAD_MESSAGES[conversationId];
    }
    // Fallback to Maya Chen's thread
    return MOCK_THREAD_MESSAGES["conv-1"] || [];
  }, [conversationId]);

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(true);

  // 3. Send message
  const handleSendMessage = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const timeFormatted = `${hours}:${minutes}`;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "current-user",
      isOutgoing: true,
      text: trimmed,
      timestamp: timeFormatted,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
  }, [inputText]);

  // 4. Emoji picker
  const handleToggleEmoji = useCallback(() => {
    Keyboard.dismiss();
    setIsEmojiPickerOpen((prev) => !prev);
  }, []);

  const handleEmojiSelected = useCallback((emojiObject: EmojiType) => {
    setInputText((prev) => prev + emojiObject.emoji);
  }, []);

  // 5. Back navigation
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)/(tabs)/messages" as any);
    }
  }, []);

  return {
    participant,
    messages,
    inputText,
    setInputText,
    isTyping,
    setIsTyping,
    isEmojiPickerOpen,
    setIsEmojiPickerOpen,
    handleToggleEmoji,
    handleEmojiSelected,
    handleSendMessage,
    handleBack,
  };
}

