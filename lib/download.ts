import JSZip from "jszip";

import { Event } from "@/types/event";
import { getAllPhotosByEvent } from "@/lib/photos";

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

export async function downloadEventPhotos(
  event: Event,
  options?: DownloadOptions
): Promise<void> {
  options?.onStatusChange?.("preparing");

  const photos = await getAllPhotosByEvent(event.id);

  if (photos.length === 0) {
    alert("Este evento no tiene fotografías.");
    return;
  }

  const zip = new JSZip();

  options?.onStatusChange?.("downloading");

  let current = 0;

  for (const photo of photos) {
    current++;

    options?.onProgress?.(
      current,
      photos.length
    );

    const response = await fetch(photo.public_url);

    if (!response.ok) {
      console.warn(
        `No se pudo descargar ${photo.file_name}`
      );
      continue;
    }

    const blob = await response.blob();

    zip.file(photo.file_name, blob);
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
}