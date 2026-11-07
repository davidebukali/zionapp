export interface ImagePreviewModalProps {
  images?: string[];
  imageUrl?: string | null;
  initialIndex?: number;
  visible?: boolean;
  onClose: () => void;
  enableDownload?: boolean;
  onDownload?: (url: string) => Promise<void> | void;
}

export interface ImagePreviewHeaderProps {
  currentIndex: number;
  totalCount: number;
  topInset: number;
  onClose: () => void;
  onDownload?: () => void;
  isDownloading?: boolean;
}

export interface ImagePreviewSlideProps {
  uri: string;
}

export interface ImagePreviewPaginationProps {
  currentIndex: number;
  totalCount: number;
  bottomInset: number;
  activeColor?: string;
}

