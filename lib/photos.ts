import { compressImage } from "@/lib/imageCompression";
import { supabase } from "@/lib/supabase";
import { createThumbnail } from "@/lib/imageThumbnail";

interface UploadProgress {
  completed: number;
  total: number;
}

export interface FailedUpload {
  file: File;
  message: string;
}

export interface UploadResult {
  uploaded: string[];
  failed: FailedUpload[];
  total: number;
  success: number;
}

export interface Photo {
  id: string;
  event_id: string;
  file_name: string;

  file_path: string;
  public_url: string;

  thumbnail_path: string;
  thumbnail_url: string;

  uploaded_at: string;
}

function buildFilePath(
  eventId: string,
  folder: "originals" | "thumbnails",
  file: File
) {
  const extension = file.name.split(".").pop() ?? "";
  const fileName = `${crypto.randomUUID()}.${extension}`;

  return {
    filePath: `${eventId}/${folder}/${fileName}`,
  };
}

async function uploadSinglePhoto(
  eventId: string,
  originalFileName: string,
  originalFile: File,
  thumbnailFile: File
): Promise<string> {
  const original = buildFilePath(
    eventId,
    "originals",
    originalFile
  );

  const thumbnail = buildFilePath(
    eventId,
    "thumbnails",
    thumbnailFile
  );

  const { error: originalError } = await supabase.storage
    .from("event-photos")
    .upload(original.filePath, originalFile);

  if (originalError) throw originalError;

  const { error: thumbnailError } = await supabase.storage
    .from("event-photos")
    .upload(thumbnail.filePath, thumbnailFile);

  if (thumbnailError) throw thumbnailError;

  const originalUrl = supabase.storage
    .from("event-photos")
    .getPublicUrl(original.filePath).data.publicUrl;

  const thumbnailUrl = supabase.storage
    .from("event-photos")
    .getPublicUrl(thumbnail.filePath).data.publicUrl;

  const { error: dbError } = await supabase
    .from("photos")
    .insert({
      event_id: eventId,
      file_name: originalFileName,

      file_path: original.filePath,
      public_url: originalUrl,

      thumbnail_path: thumbnail.filePath,
      thumbnail_url: thumbnailUrl,
    });

  if (dbError) throw dbError;

  return originalUrl;
}

async function processPhoto(
  eventId: string,
  file: File
): Promise<string> {
  const thumbnailFile =
    await createThumbnail(file);

  const compressedFile =
    await compressImage(file);

  return uploadSinglePhoto(
    eventId,
    file.name,
    compressedFile,
    thumbnailFile
  );
}

export async function uploadPhotos(
  eventId: string,
  files: File[],
  onProgress?: (
    progress: UploadProgress
  ) => void
): Promise<UploadResult> {
  const uploaded: string[] = [];
  const failed: FailedUpload[] = [];

  const total = files.length;
  let completed = 0;

  for (const file of files) {
  try {
    const publicUrl = await processPhoto(
      eventId,
      file
    );

    uploaded.push(publicUrl);
  } catch (error) {
    console.error(
      "Error al subir la fotografía:",
      file.name,
      error
    );

    failed.push({
      file,
      message:
        "No se pudo subir la fotografía.",
    });
  } finally {
    completed++;

    onProgress?.({
      completed,
      total,
    });
  }
}

  return {
    uploaded,
    failed,
    total,
    success: uploaded.length,
  };
}

export async function getPhotosByEvent(
  eventId: string,
  page = 0,
  limit = 40
) {
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("photos")
    .select("*", { count: "exact" })
    .eq("event_id", eventId)
    .order("uploaded_at", {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return {
    photos: data ?? [],
    total: count ?? 0,
  };
}

export async function getAllPhotosByEvent(
  eventId: string
): Promise<Photo[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("event_id", eventId)
    .order("uploaded_at", {
      ascending: true,
    });

  if (error) throw error;

  return data ?? [];
}

export async function getPhotoCount(
  eventId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("photos")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("event_id", eventId);

  if (error) throw error;

  return count ?? 0;
}

export async function deletePhotosByEvent(
  eventId: string
) {
  const photos = await getAllPhotosByEvent(eventId);

  if (photos.length > 0) {
    const paths = photos.flatMap((photo) => [
      photo.file_path,
      photo.thumbnail_path,
    ]);

    const { error: storageError } =
      await supabase.storage
        .from("event-photos")
        .remove(paths);

    if (storageError) {
      throw storageError;
    }

    const { error: photosError } =
      await supabase
        .from("photos")
        .delete()
        .eq("event_id", eventId);

    if (photosError) {
      throw photosError;
    }
  }
}