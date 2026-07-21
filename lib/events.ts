import { supabase } from "@/lib/supabase";
import { Event } from "@/types/event";

export async function getEvent(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function updateEvent(
  id: string,
  values: Partial<Event>
) {
  const { error } = await supabase
    .from("events")
    .update(values)
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function uploadCover(file: File, eventId: string) {
  const extension = file.name.split(".").pop();

  const path = `${eventId}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("event-covers")
    .upload(path, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("event-covers")
    .getPublicUrl(path);

  return data.publicUrl;
}