import { PostReportReason } from "../../../features/posts/types";

export const POST_REPORT_REASONS: { label: string; value: PostReportReason }[] = [
  { label: "Spam or Scam", value: "spam" },
  { label: "Harassment or Bullying", value: "harassment" },
  { label: "Hate Speech", value: "hate_speech" },
  { label: "Violence or Dangerous", value: "violence" },
  { label: "Sexual Content", value: "sexual_content" },
  { label: "False Information", value: "false_information" },
  { label: "Other", value: "other" },
];

