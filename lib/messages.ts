import { supabase } from "@/lib/supabase";
import { Message } from "@/types/message";

const MAX_TEXT_LENGTH = 300;
const MAX_AUDIO_SECONDS = 60;

function getAudioExtension(mimeType: string) {
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}

function normalizeAuthorName(authorName: string) {
  const normalized = authorName.trim().replace(/\s+/g, " ");
  return normalized ? normalized.slice(0, 80) : "Invitado";
}

export async function getMessagesByEvent(
  eventId: string,
  limit = 50
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []) as Message[];
}

export async function createTextMessage(
  eventId: string,
  authorName: string,
  content: string
) {
  const normalizedContent = content.trim();

  if (!normalizedContent) {
    throw new Error("El mensaje está vacío.");
  }

  if (normalizedContent.length > MAX_TEXT_LENGTH) {
    throw new Error(
      "El mensaje no puede exceder 300 caracteres."
    );
  }

  const { error } = await supabase
    .from("messages")
    .insert({
      event_id: eventId,
      message_type: "text",
      author_name: normalizeAuthorName(authorName),
      content: normalizedContent,
      file_path: null,
      public_url: null,
      duration_seconds: null,
    });

  if (error) throw error;
}

export async function createAudioMessage(
  eventId: string,
  authorName: string,
  audioBlob: Blob,
  durationSeconds: number
) {
  if (!audioBlob.size) {
    throw new Error("La grabación está vacía.");
  }

  const duration = Math.min(
    Math.max(Math.round(durationSeconds), 1),
    MAX_AUDIO_SECONDS
  );

  const extension = getAudioExtension(audioBlob.type);
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const filePath = `${eventId}/audio/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("event-messages")
    .upload(filePath, audioBlob, {
      contentType: audioBlob.type || "audio/webm",
      upsert: false,
      cacheControl: "31536000",
    });

  if (uploadError) throw uploadError;

  const publicUrl = supabase.storage
    .from("event-messages")
    .getPublicUrl(filePath).data.publicUrl;

  const { error: dbError } = await supabase
    .from("messages")
    .insert({
      event_id: eventId,
      message_type: "audio",
      author_name: normalizeAuthorName(authorName),
      content: null,
      file_path: filePath,
      public_url: publicUrl,
      duration_seconds: duration,
    });

  if (dbError) {
    await supabase.storage
      .from("event-messages")
      .remove([filePath]);

    throw dbError;
  }
}

export async function deleteMessage(message: Message) {
  if (message.file_path) {
    const { error: storageError } =
      await supabase.storage
        .from("event-messages")
        .remove([message.file_path]);

    if (storageError) {
      throw storageError;
    }
  }

  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", message.id);

  if (error) throw error;
}

export async function deleteMessagesByEvent(
  eventId: string
) {
  const messages = await getMessagesByEvent(
    eventId,
    1000
  );

  if (messages.length === 0) {
    return 0;
  }

  const paths = messages
    .map((message) => message.file_path)
    .filter((path): path is string => Boolean(path));

  if (paths.length > 0) {
    const { error: storageError } =
      await supabase.storage
        .from("event-messages")
        .remove(paths);

    if (storageError) {
      throw storageError;
    }
  }

  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("event_id", eventId);

  if (error) throw error;

  return messages.length;
}
