import { Message } from "@/types/message";
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

interface MessageRealtimeHandlers {
  onInsert?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
}

export function subscribeToEventMessages(
  eventId: string,
  handlers: MessageRealtimeHandlers
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
      (payload) => {
        handlers.onInsert?.(
          payload.new as Message
        );
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
      (payload) => {
        const oldMessage =
          payload.old as Partial<Message>;

        if (oldMessage.id) {
          handlers.onDelete?.(oldMessage.id);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
