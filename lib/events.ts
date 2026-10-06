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

export async function getEventContentStats() {
  const { data, error } = await supabase.rpc(
    "get_admin_event_stats"
  );

  if (error) {
    console.error("No fue posible cargar las estadísticas de eventos:", error);
    throw error;
  }

  return (data ?? []).reduce(
    (
      result: Record<
        string,
        {
          photoCount: number;
          messageCount: number;
          lastActivityAt: string | null;
        }
      >,
      item: {
        event_id: string;
        photo_count: number | string | null;
        message_count: number | string | null;
        last_activity_at: string | null;
      }
    ) => {
      result[item.event_id] = {
        photoCount: Number(item.photo_count ?? 0),
        messageCount: Number(item.message_count ?? 0),
        lastActivityAt: item.last_activity_at ?? null,
      };

      return result;
    },
    {}
  );
}
