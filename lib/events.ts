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
  const counts: Record<string, number> = {};

  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("photos")
      .select("event_id")
      .order("event_id")
      .range(from, from + pageSize - 1);

    if (error) {
      throw error;
    }

    const page = data ?? [];

    for (const photo of page) {
      counts[photo.event_id] =
        (counts[photo.event_id] ?? 0) + 1;
    }

    if (page.length < pageSize) {
      break;
    }

    from += pageSize;
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