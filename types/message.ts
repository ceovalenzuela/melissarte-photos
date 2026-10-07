export type MessageType = "text" | "audio";

export interface Message {
  id: string;
  event_id: string;
  message_type: MessageType;
  author_name: string | null;
  content: string | null;
  file_path: string | null;
  public_url: string | null;
  duration_seconds: number | null;
  created_at: string;
}
