import { supabase } from "./supabase";

export function subscribeToEventPhotos(
  eventId: string,
  callback: () => void
) {
  const channel = supabase
    .channel(`photos-${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "photos",
        filter: `event_id=eq.${eventId}`,
      },
      () => {
        callback();
      }
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "photos",
        filter: `event_id=eq.${eventId}`,
      },
      () => {
        callback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToEventMessages(
  eventId: string,
  callback: () => void
) {
  const channel = supabase
    .channel(`messages-${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `event_id=eq.${eventId}`,
      },
      () => {
        callback();
      }
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "messages",
        filter: `event_id=eq.${eventId}`,
      },
      () => {
        callback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
