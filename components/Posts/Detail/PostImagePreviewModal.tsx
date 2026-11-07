import React from "react";
import {
  ImagePreviewModal,
  ImagePreviewModalProps,
} from "../../Common/ImagePreviewModal";

export type PostImagePreviewModalProps = ImagePreviewModalProps;

export const PostImagePreviewModal = React.memo(
  function PostImagePreviewModal(props: PostImagePreviewModalProps) {
    return <ImagePreviewModal {...props} />;
  }
);
