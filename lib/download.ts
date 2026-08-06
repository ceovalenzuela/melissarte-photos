import JSZip from "jszip";

import { Event } from "@/types/event";
import { getAllPhotosByEvent, Photo } from "@/lib/photos";

export type DownloadStatus =
  | "preparing"
  | "downloading"
  | "zipping";

interface DownloadOptions {
  onStatusChange?: (
    status: DownloadStatus
  ) => void;

  onProgress?: (
    current: number,
    total: number
  ) => void;
}

const BATCH_SIZE = 5;

async function downloadPhoto(
  photo: Photo,
  zip: JSZip
): Promise<boolean> {
  try {
    const response = await fetch(photo.public_url);

    if (!response.ok) {
      return false;
    }

    const blob = await response.blob();

    zip.file(photo.file_name, blob);

    return true;
  } catch (error) {
    console.warn(
      `No se pudo descargar ${photo.file_name}`,
      error
    );

    return false;
  }
}

export async function downloadEventPhotos(
  event: Event,
  options?: DownloadOptions
): Promise<
  | { success: true }
  | { success: false; reason: "NO_PHOTOS" }
> {
  try {
  options?.onStatusChange?.("preparing");

  const photos = await getAllPhotosByEvent(event.id);

  if (photos.length === 0) {
  return {
    success: false,
    reason: "NO_PHOTOS",
  };
}

  const zip = new JSZip();

  options?.onStatusChange?.("downloading");

  let completed = 0;

  for (
    let i = 0;
    i < photos.length;
    i += BATCH_SIZE
  ) {
    const batch = photos.slice(
      i,
      i + BATCH_SIZE
    );

    const results = await Promise.all(
      batch.map((photo) =>
        downloadPhoto(photo, zip)
      )
    );

    completed += results.filter(Boolean).length;

    options?.onProgress?.(
      completed,
      photos.length
    );
  }

  options?.onStatusChange?.("zipping");

  const zipBlob = await zip.generateAsync({
    type: "blob",
  });

  const link = document.createElement("a");

  link.href = URL.createObjectURL(zipBlob);

  link.download = `${event.title}.zip`;

  link.click();

URL.revokeObjectURL(link.href);

return {
  success: true,
};

} catch (error) {
  console.error(error);

  throw error;
}
}