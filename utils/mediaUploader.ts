import * as FileSystem from "expo-file-system";
import {
  UploadUrlRequest,
  UploadUrlResponse,
  ConfirmMediaRequest,
  ConfirmMediaResponse,
  MediaStatusResponse,
  MediaDetail,
} from "../features/posts/types";
import { MAX_POLL_ATTEMPTS, POLL_INTERVAL_MS } from "../constants";

export interface MediaItem {
  uri: string;
  filename?: string;
  mimeType?: string;
  fileSize?: number;
}

export interface MediaUploaderApi {
  getMediaUploadUrl: (body: UploadUrlRequest) => { unwrap: () => Promise<UploadUrlResponse> };
  confirmMediaUpload: (body: ConfirmMediaRequest) => { unwrap: () => Promise<ConfirmMediaResponse> };
  getMediaStatus: (mediaId: string, preferCacheValue?: boolean) => { unwrap: () => Promise<MediaStatusResponse> };
}

/**
 * Resolves a valid image MIME type for uploading.
 * Defaults to 'image/jpeg' if undetectable.
 */
export function getMimeType(uri: string, rawMime?: string): string {
  if (rawMime && ["image/jpeg", "image/png", "image/webp"].includes(rawMime)) {
    return rawMime;
  }
  const ext = uri.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

/**
 * Extracts a clean filename from a local file URI.
 */
export function getFilename(uri: string, rawName?: string): string {
  if (rawName) return rawName;
  const parts = uri.split("/");
  return parts[parts.length - 1] || "photo.jpg";
}

/**
 * Uploads a single media file directly to cloud storage via presigned URL
 * and confirms the upload with the backend.
 *
 * @returns The unique media ID assigned by the backend.
 */
export async function uploadSingleMedia(
  item: MediaItem,
  getMediaUploadUrl: MediaUploaderApi["getMediaUploadUrl"],
  confirmMediaUpload: MediaUploaderApi["confirmMediaUpload"]
): Promise<string> {
  const mimeType = getMimeType(item.uri, item.mimeType);
  const filename = getFilename(item.uri, item.filename);

  // 1. Verify file exists and read exact byte count directly from disk
  const fileInfo = await FileSystem.getInfoAsync(item.uri);
  if (!fileInfo.exists) {
    throw new Error(`Media file not found: ${filename}`);
  }
  const exactSize = fileInfo.size;

  // 2. Request presigned upload URL
  const uploadUrlRes = await getMediaUploadUrl({
    filename,
    mime_type: mimeType,
    size: exactSize,
  }).unwrap();

  const mediaId = uploadUrlRes.data.id;
  const uploadUrl = uploadUrlRes.data.upload_url;

  // 3. Perform binary PUT to cloud storage
  const uploadResult = await FileSystem.uploadAsync(uploadUrl, item.uri, {
    httpMethod: "PUT",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      "Content-Type": mimeType,
    },
  });

  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error(`Storage upload failed (HTTP ${uploadResult.status})`);
  }

  // 4. Confirm upload with Laravel backend
  await confirmMediaUpload({ mediaId }).unwrap();

  return mediaId;
}

/**
 * Polls the backend status for a media item until Horizon worker finishes variant generation.
 *
 * @throws Error if processing fails on server or exceeds the timeout ceiling.
 */
export async function pollMediaUntilReady(
  mediaId: string,
  getMediaStatus: MediaUploaderApi["getMediaStatus"],
  maxAttempts: number = MAX_POLL_ATTEMPTS,
  intervalMs: number = POLL_INTERVAL_MS
): Promise<MediaDetail> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // preferCacheValue: false ensures fresh server query bypasses RTK Query cache
      const res = await getMediaStatus(mediaId, false).unwrap();
      const status = res?.data?.status;

      if (status === "ready") {
        return res.data;
      }

      if (status === "failed") {
        throw new Error("Media processing failed on the server.");
      }
    } catch (err: any) {
      if (err?.message === "Media processing failed on the server.") {
        throw err;
      }
      // Tolerate transient network glitches during polling unless on final attempt
      if (attempt === maxAttempts - 1) {
        throw err;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Media processing timed out. Please try again.");
}

/**
 * Orchestrates the full media upload and server processing pipeline:
 * 1. Uploads all files to cloud storage while updating progress.
 * 2. Polls all confirmed files concurrently until Horizon generates WebP variants.
 *
 * @returns Array of verified media IDs ready for post attachment.
 */
export async function uploadAndProcessMedia(
  mediaItems: MediaItem[],
  api: MediaUploaderApi,
  onProgress?: (status: string) => void
): Promise<string[]> {
  if (mediaItems.length === 0) {
    return [];
  }

  const total = mediaItems.length;
  let uploadCompleted = 0;

  onProgress?.(total === 1 ? "Uploading..." : `Uploading 1/${total}...`);

  // Step 1: Upload each media file and confirm with backend
  const uploadPromises = mediaItems.map(async (item) => {
    const mediaId = await uploadSingleMedia(
      item,
      api.getMediaUploadUrl,
      api.confirmMediaUpload
    );

    uploadCompleted++;
    if (uploadCompleted < total) {
      onProgress?.(`Uploading ${uploadCompleted + 1}/${total}...`);
    }

    return mediaId;
  });

  const mediaIds = await Promise.all(uploadPromises);

  // Step 2: Poll Horizon queue until all media reach 'ready' status
  onProgress?.("Processing...");
  await Promise.all(
    mediaIds.map((id) => pollMediaUntilReady(id, api.getMediaStatus))
  );

  return mediaIds;
}
