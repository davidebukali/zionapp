import { PostReportReason } from "../../../features/posts/types";

export interface ReportPostSheetProps {
  visible: boolean;
  authorName?: string;
  onClose: () => void;
  onSelectReason: (reason: PostReportReason) => void;
}

