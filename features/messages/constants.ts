import { ReportReason } from "./types";

export const MESSAGE_REPORT_REASONS: { label: string; value: ReportReason }[] = [
  { label: "Spam or Scam", value: "spam" },
  { label: "Harassment or Bullying", value: "harassment" },
  { label: "Hate Speech", value: "hate_speech" },
  { label: "Inappropriate Content", value: "inappropriate_content" },
  { label: "Violence or Dangerous", value: "violence" },
  { label: "Other", value: "other" },
];

export const QUICK_REACTION_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

export const TEMP_MESSAGE_ID_PREFIX = "temp-";

