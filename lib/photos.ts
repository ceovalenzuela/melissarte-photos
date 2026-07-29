import { compressImage } from "@/lib/imageCompression";
import { supabase } from "@/lib/supabase";

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

function buildFilePath(eventId: string, file: File) {
  const extension = file.name.split(".").pop() ?? "";
  const fileName = `${crypto.randomUUID()}.${extension}`;

  return {
    filePath: `${eventId}/${fileName}`,
  };
}

async function uploadSinglePhoto(
  eventId: string,
  originalFileName: string,
  file: File
): Promise<string> {
  const { filePath } = buildFilePath(eventId, file);

  const { error: storageError } = await supabase.storage
    .from("event-photos")
    .upload(filePath, file);

  if (storageError) throw storageError;

  const { data } = supabase.storage
    .from("event-photos")
    .getPublicUrl(filePath);

  const publicUrl = data.publicUrl;

  const { error: dbError } = await supabase
    .from("photos")
    .insert({
      event_id: eventId,
      file_name: originalFileName,
      file_path: filePath,
      public_url: publicUrl,
    });

  if (dbError) throw dbError;

  return publicUrl;
}

export async function uploadPhotos(
  eventId: string,
  files: File[],
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const uploaded: string[] = [];
  const failed: FailedUpload[] = [];

  const total = files.length;
  let completed = 0;

  for (const file of files) {
    try {
      const compressedFile = await compressImage(file);

      const publicUrl = await uploadSinglePhoto(
        eventId,
        file.name,
        compressedFile
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
        message: "No se pudo subir la fotografía.",
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

export async function getPhotosByEvent(eventId: string) {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("event_id", eventId)
    .order("uploaded_at", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}