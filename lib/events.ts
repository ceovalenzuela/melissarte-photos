import { supabase } from "@/lib/supabase";
import { Event } from "@/types/event";

export async function getEvent(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from("events_public")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function getEventBySlug(
  slug: string
): Promise<Event | null> {
  const { data, error } = await supabase.rpc(
    "get_public_event_by_slug",
    {
      p_slug: slug,
    }
  );

  if (error) {
    console.error(
      "ERROR getEventBySlug:",
      JSON.stringify(error, null, 2)
    );

    return null;
  }

  return data?.[0] ?? null;
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
  const extension =
  file.name.split(".").pop() ?? "jpg";

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

export async function getPhotoCounts() {
  const { data, error } = await supabase
    .from("photos")
    .select("event_id");

  if (error) {
    throw error;
  }

  const counts: Record<string, number> = {};

  for (const photo of data ?? []) {
    counts[photo.event_id] =
      (counts[photo.event_id] ?? 0) + 1;
  }

  return counts;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}