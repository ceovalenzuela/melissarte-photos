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

export type PhotoSortOrder =
  | "newest"
  | "oldest";

export async function getPhotosByEvent(
  eventId: string,
  page = 0,
  limit = 40,
  sortOrder: PhotoSortOrder = "newest"
) {
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("photos")
    .select("*", { count: "exact" })
    .eq("event_id", eventId)
    .order("uploaded_at", {
      ascending: sortOrder === "oldest",
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
  const allPhotos: Photo[] = [];
  const pageSize = 500;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .eq("event_id", eventId)
      .order("uploaded_at", {
        ascending: true,
      })
      .range(from, from + pageSize - 1);

    if (error) throw error;

    const page = data ?? [];

    allPhotos.push(...page);

    if (page.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return allPhotos;
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

export async function deletePhotoWithToken(
  eventId: string,
  photoId: string,
  token: string
) {
  const { data, error } = await supabase.rpc(
    "delete_photo_with_token",
    {
      p_event_id: eventId,
      p_photo_id: photoId,
      p_token: token,
    }
  );

  if (error) {
    throw error;
  }

  const authorizedPhoto = Array.isArray(data)
    ? data[0]
    : data;

  if (
    !authorizedPhoto?.file_path ||
    !authorizedPhoto?.thumbnail_path
  ) {
    throw new Error(
      "No tienes permiso para eliminar esta fotografía."
    );
  }

  const paths = [
    authorizedPhoto.file_path,
    authorizedPhoto.thumbnail_path,
  ];

  const { error: storageError } =
    await supabase.storage
      .from("event-photos")
      .remove(paths);

  if (storageError) {
    throw storageError;
  }

  const { data: deleted, error: deleteError } =
    await supabase.rpc(
      "delete_photo_record_with_token",
      {
        p_event_id: eventId,
        p_photo_id: photoId,
        p_token: token,
      }
    );

  if (deleteError) {
    throw deleteError;
  }

  if (!deleted) {
    throw new Error(
      "La fotografía no pudo eliminarse de la galería."
    );
  }
}

export async function deletePhoto(photo: Photo) {
  const paths = [
    photo.file_path,
    photo.thumbnail_path,
  ];

  const { error: storageError } =
    await supabase.storage
      .from("event-photos")
      .remove(paths);

  if (storageError) {
    throw storageError;
  }

  const { data, error } = await supabase.rpc(
    "delete_photo_admin",
    {
      p_photo_id: photo.id,
    }
  );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "La fotografía no pudo eliminarse."
    );
  }
}

export async function deletePhotosByEvent(
  eventId: string
) {
  const photos = await getAllPhotosByEvent(eventId);

  if (photos.length === 0) {
    return 0;
  }

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

  const { data, error } = await supabase.rpc(
    "delete_photos_admin",
    {
      p_event_id: eventId,
    }
  );

  if (error) {
    throw error;
  }

  return data ?? 0;
}