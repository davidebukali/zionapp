import { ChatMessage, Conversation, OnlineContact } from "./types";

export const MOCK_ACTIVE_CONTACTS: OnlineContact[] = [
  {
    id: "user-maya",
    name: "Maya Chen",
    username: "mayachen",
    initials: "MC",
    isOnline: true,
    avatarColor: "#7CB342", // Lime green from mockup
  },
  {
    id: "user-studio",
    name: "Studio North",
    username: "studionorth",
    initials: "SN",
    isOnline: false,
    avatarColor: "#E64A19", // Coral orange
  },
  {
    id: "user-dev",
    name: "Dev Patel",
    username: "devpatel",
    initials: "DP",
    isOnline: true,
    avatarColor: "#8BC34A", // Lime green
  },
  {
    id: "user-jordan",
    name: "Jordan Vélez",
    username: "jordanvelez",
    initials: "JV",
    isOnline: false,
    avatarColor: "#9E9D24", // Yellow green
  },
  {
    id: "user-riya",
    name: "Riya Kapoor",
    username: "riyakapoor",
    initials: "RK",
    isOnline: false,
    avatarColor: "#F4511E", // Warm orange
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    participant: MOCK_ACTIVE_CONTACTS[0], // Maya Chen
    lastMessage: {
      text: "haha okay sending it now",
      type: "text",
      timestamp: "2m",
    },
    unreadCount: 2,
  },
  {
    id: "conv-2",
    participant: MOCK_ACTIVE_CONTACTS[1], // Studio North
    lastMessage: {
      text: "love that direction",
      type: "outgoing",
      timestamp: "1h",
    },
    unreadCount: 0,
  },
  {
    id: "conv-3",
    participant: MOCK_ACTIVE_CONTACTS[2], // Dev Patel
    lastMessage: {
      text: "reacted ❤️ to your message",
      type: "reaction",
      timestamp: "3h",
      reactionEmoji: "❤️",
    },
    unreadCount: 1,
  },
  {
    id: "conv-4",
    participant: MOCK_ACTIVE_CONTACTS[3], // Jordan Vélez
    lastMessage: {
      text: "let's pick this up tomorrow",
      type: "text",
      timestamp: "1d",
    },
    unreadCount: 0,
  },
  {
    id: "conv-5",
    participant: MOCK_ACTIVE_CONTACTS[4], // Riya Kapoor
    lastMessage: {
      text: "Photo",
      type: "photo",
      timestamp: "2d",
    },
    unreadCount: 0,
  },
];

export const MOCK_THREAD_MESSAGES: Record<string, ChatMessage[]> = {
  "conv-1": [
    {
      id: "msg-1",
      senderId: "user-maya",
      isOutgoing: false,
      text: "okay but the new banner colors are 🔥🔥",
      timestamp: "9:12",
    },
    {
      id: "msg-2",
      senderId: "current-user",
      isOutgoing: true,
      text: "ty ty, I was so close to scrapping it last night",
      timestamp: "9:12",
      reactions: ["❤️"],
    },
    {
      id: "msg-3",
      senderId: "user-maya",
      isOutgoing: false,
      mediaUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
      timestamp: "9:13",
    },
    {
      id: "msg-4",
      senderId: "user-maya",
      isOutgoing: false,
      text: "this one specifically. fr.",
      timestamp: "9:13",
    },
    {
      id: "msg-5",
      senderId: "current-user",
      isOutgoing: true,
      text: "ok cropping it for the post now",
      timestamp: "9:14",
      readReceipt: "Read 9:14 · ❤️",
    },
  ],
};

