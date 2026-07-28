import { supabase } from "@/lib/supabase";

export async function uploadPhotos(
  eventId: string,
  files: File[]
) {
  const uploaded: string[] = [];

  for (const file of files) {
    const extension = file.name.split(".").pop();

    const fileName = `${crypto.randomUUID()}.${extension}`;

    const filePath = `${eventId}/${fileName}`;

    const { error } = await supabase.storage
      .from("event-photos")
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("event-photos")
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    const { error: dbError } = await supabase
      .from("photos")
      .insert({
        event_id: eventId,
        file_name: file.name,
        file_path: filePath,
        public_url: publicUrl,
      });

    if (dbError) throw dbError;

    uploaded.push(publicUrl);
  }

  return uploaded;
}

export async function getPhotosByEvent(
  eventId: string
) {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("event_id", eventId)
    .order("uploaded_at", { ascending: false });

  if (error) throw error;

  return data;
}